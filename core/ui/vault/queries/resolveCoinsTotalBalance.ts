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
 * "updating" affordance alongside the partial number, and `isIncomplete` flags a
 * total that excludes coins whose reads failed, so it is never mistaken for a
 * full balance.
 */
export type TotalBalanceQuery = Query<number> & {
  isUpdating: boolean
  isIncomplete: boolean
}

type ResolveCoinsTotalBalanceInput = {
  coins: AccountCoin[]
  prices: Record<string, number> | undefined
  balances: Record<string, bigint> | undefined
  isPending: boolean
  error: unknown
}

/**
 * Sums the fiat value of every coin whose price and balance have resolved. A
 * coin without a balance contributes nothing rather than zero; with at least one
 * resolved coin the partial total is returned and marked incomplete when a read
 * failed, and only when nothing resolved does the failure surface as an error.
 * A failed background refetch that left every coin with cached data is not an
 * error either: the total is complete, so `error` stays null.
 */
export const resolveCoinsTotalBalance = ({
  coins,
  prices,
  balances,
  isPending,
  error,
}: ResolveCoinsTotalBalanceInput): TotalBalanceQuery => {
  let resolvedCount = 0
  const total = sum(
    coins.map(coin => {
      const price = prices?.[coinKeyToString(coin)]
      const amount =
        balances?.[accountCoinKeyToString(extractAccountCoinKey(coin))]

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

  const hasError = error !== null && error !== undefined
  const noCoins = coins.length === 0
  const isUpdating = !noCoins && isPending
  // A settled zero: no coins at all, or every coin has settled (not loading, no
  // error) without a resolvable price/balance. Both are final zeros — resolve to
  // 0 so callers render "$0.00" instead of a blank header.
  const isSettledZero =
    noCoins || (!isUpdating && !hasError && resolvedCount === 0)
  const hasResolvedData = resolvedCount > 0 || isSettledZero
  const hasCompleteData = resolvedCount === coins.length
  const isPendingResult = !hasResolvedData && isUpdating

  return {
    data: hasResolvedData ? total : undefined,
    isPending: isPendingResult,
    isUpdating,
    isIncomplete: hasResolvedData && hasError && !hasCompleteData,
    error: isPendingResult || hasCompleteData ? null : error,
  }
}
