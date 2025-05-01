import { CosmosChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getCosmosAccountInfo = async ({
  chain,
  address,
}: ChainAccount<CosmosChain>) => {
  const client = await getCosmosClient(chain)
  const accountInfo = shouldBePresent(await client.getAccount(address))
  const block = await client.getBlock()
  const blockTimestampStr = block.header.time
  const blockTimestampNs =
    BigInt(new Date(blockTimestampStr).getTime()) * 1_000_000n

  const timeoutNs = blockTimestampNs + 600_000_000_000n // +10 minutes
  const latestBlock = `${block.header.height}_${timeoutNs}`

  return {
    ...accountInfo,
    latestBlock,
  }
}
