import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import type { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { fromBase64 } from '@cosmjs/encoding'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { getCosmosChainSpecific } from '../../signingInputs/resolvers/cosmos/chainSpecific'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { FeeAmountResolver } from '../resolver'

const mayaGas = 2000000000n

const sumFeeAmountForDenom = (
  amounts: readonly { denom: string; amount: string }[],
  chainFeeDenom: string
): bigint =>
  amounts
    .filter(a => a.denom === chainFeeDenom)
    .reduce((sum, a) => sum + BigInt(a.amount || '0'), 0n)

const getCosmosFeeFromSignData = (
  keysignPayload: KeysignPayload,
  chain: CosmosChain
): bigint | null => {
  const chainFeeDenom = cosmosFeeCoinDenom[chain]
  const signData = keysignPayload.signData

  if (signData.case === 'signDirect') {
    const authInfoBytes = fromBase64(signData.value.authInfoBytes)
    const authInfo = AuthInfo.decode(authInfoBytes)
    if (!authInfo.fee?.amount) return null
    return sumFeeAmountForDenom(authInfo.fee.amount, chainFeeDenom)
  }

  if (signData.case === 'signAmino') {
    const feeAmounts = signData.value.fee?.amount
    if (!feeAmounts) return null
    return sumFeeAmountForDenom(feeAmounts, chainFeeDenom)
  }

  return null
}

export const getCosmosFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const chain = getKeysignChain<'cosmos'>(keysignPayload)

  const chainSpecific = getCosmosChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  return matchRecordUnion(chainSpecific, {
    ibcEnabled: ({ gas }) => gas,
    vaultBased: value => {
      const feeFromSignData = getCosmosFeeFromSignData(keysignPayload, chain)
      if (feeFromSignData !== null) {
        return feeFromSignData
      }

      if ('fee' in value) {
        return value.fee
      }

      return mayaGas
    },
  })
}
