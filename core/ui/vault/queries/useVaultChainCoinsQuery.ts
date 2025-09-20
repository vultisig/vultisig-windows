import { Chain } from '@core/chain/Chain'
import { useYieldBearingTokensPrices } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/hooks/useYieldBearingTokensPrices'
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

  const tickers = coins.map(c => c.ticker)
  const yPricesQuery = useYieldBearingTokensPrices(tickers)

  return useMemo((): Query<VaultChainCoin[]> => {
    if (
      pricesQuery.isPending ||
      balancesQuery.isPending ||
      yPricesQuery.isPending
    ) {
      return pendingQuery
    }

    if (pricesQuery.data && balancesQuery.data) {
      const basePrices = shouldBePresent(pricesQuery.data)
      const balances = shouldBePresent(balancesQuery.data)
      const yPrices = yPricesQuery.data ?? {}

      const data = without(
        coins.map(coin => {
          const amount = balances[coinKeyToString(coin)] ?? BigInt(0)
          const basePrice = basePrices[coinKeyToString(coin)]
          const overridePrice = yPrices[coin.ticker]
          const price = overridePrice ?? basePrice

          return { ...coin, amount, price }
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
  }, [balancesQuery, coins, pricesQuery, yPricesQuery])
}
