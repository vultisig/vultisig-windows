import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { sum } from '@lib/utils/array/sum'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

export const useVaultTotalBalanceQuery = () => {
  const coins = useCurrentVaultCoins()

  const pricesQuery = useCoinPricesQuery({
    coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return useMemo((): Query<number> => {
    if (pricesQuery.isPending || balancesQuery.isPending) {
      return pendingQuery
    }

    if (pricesQuery.data && balancesQuery.data) {
      const data = sum(
        coins.map(coin => {
          const price = shouldBePresent(pricesQuery.data)[coinKeyToString(coin)]
          const amount = shouldBePresent(balancesQuery.data)[
            coinKeyToString(coin)
          ]

          if (price === undefined || amount === undefined) {
            return 0
          }
          return getCoinValue({
            amount,
            decimals: coin.decimals,
            price: price,
          })
        })
      )

      return getResolvedQuery(data)
    }

    return {
      isPending: false,
      data: undefined,
      error: [...balancesQuery.errors, ...pricesQuery.errors][0],
    }
  }, [balancesQuery, coins, pricesQuery])
}
