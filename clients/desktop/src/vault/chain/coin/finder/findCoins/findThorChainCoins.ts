import { Chain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { without } from '@lib/utils/array/without'

import { FindCoinsResolver } from './FindCoinsResolver'

export const findThorChainCoins: FindCoinsResolver = async ({ address }) => {
  const chain = Chain.THORChain
  const client = await getCosmosClient(chain)
  const balances = await client.getAllBalances(address)

  const denoms = without(
    balances.map(balance => balance.denom),
    cosmosFeeCoinDenom[chain]
  )

  console.log('findThorChainCoins denoms: ', denoms)

  return []
}
