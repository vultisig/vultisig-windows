import { fromBase64 } from '@cosmjs/encoding'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { sumFeeAmountForCosmosChainFeeDenom } from '@vultisig/core-chain/chains/cosmos/sumFeeAmountForCosmosChainFeeDenom'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

type FeeAmount = { denom: string; amount: string }

const getDappFeeAmounts = (
  signData: KeysignPayload['signData']
): readonly FeeAmount[] | undefined => {
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

const executeContractMsgTypes: ReadonlySet<string> = new Set([
  CosmosMsgType.MSG_EXECUTE_CONTRACT,
  CosmosMsgType.MSG_EXECUTE_CONTRACT_URL,
])

const isExecuteContractSignData = (
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

type ApplyCosmosFeeFromSignDataInput = {
  keysignPayload: KeysignPayload
  chain: CosmosChain
}

/**
 * Reconciles the dapp-supplied fee from `signData` (signAmino or signDirect)
 * with the chain-default fee already in `blockchainSpecific`, writing the
 * resulting estimate to `thorchainSpecific.fee` / `cosmosSpecific.gas` so the
 * Network Fee row on the keysign popup matches what the user will actually pay.
 *
 * Reconciliation rule:
 *   - `MsgExecuteContract` (any cosmos chain): use signed. Contract calls pay
 *     exactly what's in `fee.amount` (gas × gas_price the dapp simulated).
 *   - Non-contract on vaultBased chains (THORChain): keep the chain-default
 *     already in `thorchainSpecific.fee`. THORChain ignores `fee.amount` and
 *     deducts a flat `NativeTransactionFee` (currently 0.02 RUNE); whatever
 *     the dapp signed is decorative.
 *   - Non-contract on ibcEnabled chains (Osmosis, Cosmos Hub, etc.): use
 *     signed. The chain deducts exactly `fee.amount`.
 *
 * No-op when:
 *   - the chain isn't cosmos-routed (caller guards on `isChainOfKind('cosmos')`)
 *   - no dapp signData is present (e.g., native sends Vultisig built itself)
 *   - the dapp paid in a non-native fee denom (we can't collapse a multi-denom
 *     fee into the proto's single `uint64`; leaves the estimate in place)
 *   - `blockchainSpecific.case` is `mayachainSpecific` (no `fee` field on that
 *     schema — safe to skip; MAYA uses a hardcoded fallback elsewhere)
 */
export const applyCosmosFeeFromSignData = ({
  keysignPayload,
  chain,
}: ApplyCosmosFeeFromSignDataInput): void => {
  const feeAmounts = getDappFeeAmounts(keysignPayload.signData)
  if (!feeAmounts) return

  const signedFee = sumFeeAmountForCosmosChainFeeDenom({
    amounts: feeAmounts,
    chain,
  })
  if (signedFee === null) return

  const { blockchainSpecific } = keysignPayload
  const isExecuteContract = isExecuteContractSignData(keysignPayload.signData)

  if (blockchainSpecific.case === 'thorchainSpecific') {
    if (isExecuteContract) {
      blockchainSpecific.value.fee = signedFee
    }
    return
  }

  if (blockchainSpecific.case === 'cosmosSpecific') {
    blockchainSpecific.value.gas = signedFee
  }
}
