import { CosmosChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getCosmosAccountInfo = async ({
  chain,
  address,
}: ChainAccount<CosmosChain>) => {
  const client = await getCosmosClient(chain)
  const accountInfo = await client.getAccount(address)
  return shouldBePresent(accountInfo, `Account: ${address}`)
}
