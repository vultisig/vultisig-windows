import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getCosmosTxStatus: TxStatusResolver<CosmosChain> = async ({
  chain,
  hash,
}) => {
  const client = await getCosmosClient(chain)

  const { data: tx, error } = await attempt(client.getTx(hash))

  if (error || !tx) {
    return 'pending'
  }

  return tx.code === 0 ? 'success' : 'error'
}
