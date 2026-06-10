import { fromBase64 } from '@cosmjs/encoding'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { getCosmosChainKind } from '@vultisig/core-chain/chains/cosmos/utils/getCosmosChainKind'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

type DappCosmosFeeAmount = { denom: string; amount: string }

const executeContractMsgTypes: ReadonlySet<string> = new Set([
  CosmosMsgType.MSG_EXECUTE_CONTRACT,
  CosmosMsgType.MSG_EXECUTE_CONTRACT_URL,
])

export const getDappCosmosFeeAmounts = (
  signData: KeysignPayload['signData']
): readonly DappCosmosFeeAmount[] | undefined => {
  if (signData.case === 'signAmino') {
    return signData.value.fee?.amount
  }
  if (signData.case === 'signDirect') {
    const result = attempt(() =>
      AuthInfo.decode(fromBase64(signData.value.authInfoBytes))
    )
    if ('error' in result) return undefined
    return result.data.fee?.amount
  }
  return undefined
}

export const isExecuteContractSignData = (
  signData: KeysignPayload['signData']
): boolean => {
  if (signData.case === 'signAmino') {
    return signData.value.msgs.some(msg =>
      executeContractMsgTypes.has(msg.type)
    )
  }
  if (signData.case === 'signDirect') {
    const result = attempt(() =>
      TxBody.decode(fromBase64(signData.value.bodyBytes))
    )
    if ('error' in result) return false
    return result.data.messages.some(msg =>
      executeContractMsgTypes.has(msg.typeUrl)
    )
  }
  return false
}

const isNativeCosmosFeeDenom = ({
  denom,
  chain,
}: {
  denom: string
  chain: CosmosChain
}) => denom.toLowerCase() === cosmosFeeCoinDenom[chain].toLowerCase()

const formatDappCosmosFeeAmount = ({ amount, denom }: DappCosmosFeeAmount) =>
  `${amount} ${denom}`

const shouldDisplaySignedDappCosmosFee = ({
  keysignPayload,
  chain,
}: {
  keysignPayload: KeysignPayload
  chain: CosmosChain
}) =>
  getCosmosChainKind(chain) === 'ibcEnabled' ||
  isExecuteContractSignData(keysignPayload.signData)

export const getNonNativeDappCosmosFeeDisplay = ({
  keysignPayload,
  chain,
}: {
  keysignPayload: KeysignPayload
  chain: CosmosChain
}): string | null => {
  if (!shouldDisplaySignedDappCosmosFee({ keysignPayload, chain })) {
    return null
  }

  const amounts = getDappCosmosFeeAmounts(keysignPayload.signData)?.filter(
    ({ amount, denom }) => amount && denom
  )

  if (!amounts?.length) return null

  if (amounts.every(({ denom }) => isNativeCosmosFeeDenom({ denom, chain }))) {
    return null
  }

  return amounts.map(formatDappCosmosFeeAmount).join(' + ')
}
