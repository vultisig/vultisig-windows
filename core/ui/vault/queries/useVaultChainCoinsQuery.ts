import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { CoinAmount, CoinKey, coinKeyToString } from '@core/chain/coin/Coin'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@lib/utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { useMemo } from 'react'

export type VaultChainCoin = CoinKey &
  CoinAmount &
  Partial<EntityWithLogo> &
  EntityWithTicker &
  Partial<EntityWithPrice>

export const useVaultChainCoinsQuery = (chain: Chain) => {
  const coins = useCurrentVaultChainCoins(chain)

  const pricesQuery = useCoinPricesQuery({
    coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return useMemo((): Query<VaultChainCoin[]> => {
    if (pricesQuery.isPending || balancesQuery.isPending) {
      return pendingQuery
    }

    if (pricesQuery.data && balancesQuery.data) {
      const data = without(
        coins.map(coin => {
          const amount =
            shouldBePresent(balancesQuery.data)[coinKeyToString(coin)] ||
            BigInt(0)

          const price = shouldBePresent(pricesQuery.data)[coinKeyToString(coin)]

          return {
            ...coin,
            amount,
            price,
          }
        }),
        undefined
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
