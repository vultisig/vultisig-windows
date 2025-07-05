import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'

import { FindCoinsResolver } from './FindCoinsResolver'

export const findCosmosCoins: FindCoinsResolver<CosmosChain> = async ({
  address,
  chain,
}) => {
  // While it should work for other cosmos chains, we only support THORChain for now
  if (chain !== CosmosChain.THORChain) {
    return []
  }

  const client = await getCosmosClient(chain)
  const balances = await client.getAllBalances(address)

  const denoms = without(
    balances.map(balance => balance.denom),
    cosmosFeeCoinDenom[chain]
  )

  return without(
    denoms.map(denom => {
      const tickerAttempt = attempt(() => {
        const parts = denom.split(/[-.]/)
        // If the denom has separators, use the second part (index 1)
        // Otherwise, use the entire denom as the ticker
        const tickerPart = parts.length > 1 ? parts[1] : denom
        return shouldBePresent(tickerPart?.toUpperCase())
      })

      if ('error' in tickerAttempt) {
        console.error(`Failed to extract ticker from ${denom}`)
        return
      }

      const ticker = tickerAttempt.data
      const logo = ticker.toLowerCase()

      return {
        id: denom,
        chain,
        decimals: chainFeeCoin[chain].decimals,
        ticker,
        logo,
        address,
      }
    }),
    undefined
  )
}
