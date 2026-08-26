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
 * `isUpdating` stays true while any coin is still loading so the UI can render an
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
  failedCoins: string[]
  isPricesPending: boolean
  error: unknown
}

/**
 * Sums the fiat value of every coin whose price and balance have resolved. A
 * coin without a balance contributes nothing rather than zero; with at least one
 * resolved coin the partial total is returned and marked incomplete when a read
 * failed, and only when nothing resolved does the failure surface as an error.
 * Failed coins are judged from `failedCoins` rather than the current query
 * error, so a failure persists while the read is retried in the background,
 * and a coin that is neither resolved nor failed counts as still loading. A
 * failed background refetch that left every coin with cached data is not an
 * error either: the total is complete, so `error` stays null.
 */
export const resolveCoinsTotalBalance = ({
  coins,
  prices,
  balances,
  failedCoins,
  isPricesPending,
  error,
}: ResolveCoinsTotalBalanceInput): TotalBalanceQuery => {
  const failedCoinKeys = new Set(failedCoins)
  let resolvedCount = 0
  let hasFailedCoin = false
  let hasLoadingCoin = false

  const total = sum(
    coins.map(coin => {
      const balanceKey = accountCoinKeyToString(extractAccountCoinKey(coin))
      const amount = balances?.[balanceKey]

      if (amount === undefined) {
        if (failedCoinKeys.has(balanceKey)) {
          hasFailedCoin = true
        } else {
          hasLoadingCoin = true
        }

        return 0
      }

      const price = prices?.[coinKeyToString(coin)]

      if (price === undefined) {
        if (isPricesPending) {
          hasLoadingCoin = true
        }

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

  const hasError = (error !== null && error !== undefined) || hasFailedCoin
  const noCoins = coins.length === 0
  const isUpdating = hasLoadingCoin
  // A settled zero: no coins at all, or every coin has settled (not loading, no
  // error) without a resolvable price/balance. Both are final zeros — resolve to
  // 0 so callers render "$0.00" instead of a blank header.
  const isSettledZero =
    noCoins || (!isUpdating && !hasError && resolvedCount === 0)
  const hasResolvedData = resolvedCount > 0 || isSettledZero
  const hasCompleteData = resolvedCount === coins.length
  const isPending = !hasResolvedData && isUpdating
  const shouldSurfaceError = hasError && !isPending && !hasCompleteData

  return {
    data: hasResolvedData ? total : undefined,
    isPending,
    isUpdating,
    isIncomplete: hasResolvedData && hasError && !hasCompleteData,
    error: shouldSurfaceError
      ? (error ?? new Error('Failed to load balances'))
      : null,
  }
}
