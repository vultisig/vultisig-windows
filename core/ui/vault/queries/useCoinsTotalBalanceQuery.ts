import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { Query } from '@lib/ui/query/Query'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { sum } from '@vultisig/lib-utils/array/sum'

/**
 * Total fiat balance for a set of coins, resolved progressively. `data` reflects
 * the partial sum of every coin whose price and balance have already landed, so
 * callers can show a running total instead of blocking on the slowest coin.
 * `isUpdating` stays true while any coin is still pending so the UI can render an
 * "updating" affordance alongside the partial number.
 */
export type TotalBalanceQuery = Query<number> & { isUpdating: boolean }

/**
 * Shared progressive fiat-total query used for both the vault-wide total and the
 * per-chain total. Sums only the coins whose price and balance have resolved.
 */
export const useCoinsTotalBalanceQuery = (
  coins: AccountCoin[]
): TotalBalanceQuery => {
  const pricesQuery = useCoinPricesQuery({
    coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  const prices = pricesQuery.data ?? {}
  const balances = balancesQuery.data ?? {}

  let resolvedCount = 0
  const total = sum(
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

  const error = [...balancesQuery.errors, ...pricesQuery.errors][0] ?? null

  const noCoins = coins.length === 0
  const isUpdating =
    !noCoins && (pricesQuery.isPending || balancesQuery.isPending)
  // A settled zero: no coins at all, or every coin has settled (not loading, no
  // error) without a resolvable price/balance. Both are final zeros — resolve to
  // 0 so callers render "$0.00" instead of a blank header.
  const isSettledZero =
    noCoins || (!isUpdating && !error && resolvedCount === 0)

  return {
    data: resolvedCount > 0 || isSettledZero ? total : undefined,
    isPending: resolvedCount === 0 && !isSettledZero && isUpdating,
    isUpdating,
    error,
  }
}
