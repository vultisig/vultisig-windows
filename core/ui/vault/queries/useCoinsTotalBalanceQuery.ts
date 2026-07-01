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

  // An empty coin set is a settled zero, not a loading state — resolve it to 0 so
  // callers read a number instead of undefined, and never flag it as updating.
  const isSettledZero = coins.length === 0
  const isUpdating =
    !isSettledZero && (pricesQuery.isPending || balancesQuery.isPending)

  return {
    data: resolvedCount > 0 || isSettledZero ? total : undefined,
    isPending: resolvedCount === 0 && !isSettledZero && isUpdating,
    isUpdating,
    error: [...balancesQuery.errors, ...pricesQuery.errors][0] ?? null,
  }
}
