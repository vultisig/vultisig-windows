import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { getCosmosChainSpecific } from '../../signingInputs/resolvers/cosmos/chainSpecific'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { FeeAmountResolver } from '../resolver'

const mayaGas = 2000000000n

export const getCosmosFeeAmount: FeeAmountResolver = ({ keysignPayload }) => {
  const chain = getKeysignChain<'cosmos'>(keysignPayload)

  const chainSpecific = getCosmosChainSpecific(
    chain,
    keysignPayload.blockchainSpecific
  )

  return matchRecordUnion(chainSpecific, {
    ibcEnabled: ({ gas }) => gas,
    vaultBased: value => {
      if ('fee' in value) {
        return value.fee
      }

      return mayaGas
    },
  })
}
