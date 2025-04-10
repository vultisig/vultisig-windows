import { Chain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { without } from '@lib/utils/array/without'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'

import { FindCoinsResolver } from './FindCoinsResolver'

export const findThorChainCoins: FindCoinsResolver = async ({ address }) => {
  const chain = Chain.THORChain
  const client = await getCosmosClient(chain)
  const balances = await client.getAllBalances(address)

  const denoms = without(
    balances.map(balance => balance.denom),
    cosmosFeeCoinDenom[chain]
  )

  return withoutUndefined(
    denoms.map(denom => {
      const tickerAttempt = attempt(() =>
        shouldBePresent(denom.split(/[-.]/).at(1)?.toUpperCase())
      )

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
    })
  )
}
