import { isoToNanoseconds } from '@lib/utils/time/isoToNanoseconds'

import { CosmosChain } from '../../../Chain'
import { getCosmosClient } from '../client'

export const getIbcDenomTrace = async (
  chain: CosmosChain
): Promise<{ latestBlock: string }> => {
  const client = await getCosmosClient(chain)
  const latestBlock = await client.getBlock()
  const height = latestBlock.header.height
  const nanoSecondTimestamp = isoToNanoseconds(latestBlock.header.time)

  return {
    latestBlock: `${height}_${nanoSecondTimestamp.toString()}`,
  }
}
