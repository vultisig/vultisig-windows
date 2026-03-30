import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { getResolvedQuery, pendingQuery, Query } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import {
  CoinAmount,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { without } from '@vultisig/lib-utils/array/without'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { EntityWithLogo } from '@vultisig/lib-utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@vultisig/lib-utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@vultisig/lib-utils/entities/EntityWithTicker'
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
      const basePrices = shouldBePresent(pricesQuery.data)
      const balances = shouldBePresent(balancesQuery.data)

      const data = without(
        coins.map(coin => {
          const balanceKey = accountCoinKeyToString(extractAccountCoinKey(coin))
          const amount = balances[balanceKey] ?? BigInt(0)
          const price = basePrices[coinKeyToString(coin)]

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
  }, [balancesQuery, coins, pricesQuery])
}
