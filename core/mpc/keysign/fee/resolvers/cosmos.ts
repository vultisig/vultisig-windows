import { CosmosChain } from '@core/chain/Chain'
import { mayaGas } from '@core/chain/feeQuote/resolvers/cosmos'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { getCosmosChainSpecific } from '../../signingInputs/resolvers/cosmos/chainSpecific'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { GetFeeAmountResolver } from '../resolver'

export const getCosmosFeeAmount: GetFeeAmountResolver = ({
  keysignPayload,
  publicKey: _publicKey,
}) => {
  const chain = getKeysignChain(keysignPayload) as CosmosChain

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
