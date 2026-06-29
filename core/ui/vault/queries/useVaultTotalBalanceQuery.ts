import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Query } from '@lib/ui/query/Query'
import {
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { sum } from '@vultisig/lib-utils/array/sum'

/**
 * Vault total balance, resolved progressively. `data` reflects the partial sum
 * of every coin whose price and balance have already landed, so the header can
 * show a running total instead of blocking on the slowest chain. `isUpdating`
 * stays true while any coin is still pending so the UI can render an
 * "updating" affordance alongside the partial number.
 */
type VaultTotalBalanceQuery = Query<number> & { isUpdating: boolean }

export const useVaultTotalBalanceQuery = (): VaultTotalBalanceQuery => {
  const coins = usePortfolioVaultCoins()

  const pricesQuery = useCoinPricesQuery({
    coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  const prices = pricesQuery.data ?? {}
  const balances = balancesQuery.data ?? {}

  let resolvedCount = 0
  const data = sum(
    coins.map(coin => {
      const price = prices[coinKeyToString(coin)]
      const amount =
        balances[accountCoinKeyToString(extractAccountCoinKey(coin))]

      if (price === undefined || amount === undefined) {
        return 0
      }

      resolvedCount++
      return getCoinValue({
        amount,
        decimals: coin.decimals,
        price,
      })
    })
  )

  const isUpdating = pricesQuery.isPending || balancesQuery.isPending

  return {
    data: resolvedCount > 0 ? data : undefined,
    isPending: resolvedCount === 0 && isUpdating,
    isUpdating,
    error: [...balancesQuery.errors, ...pricesQuery.errors][0] ?? null,
  }
}
