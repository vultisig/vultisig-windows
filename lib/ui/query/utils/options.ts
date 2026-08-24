import { UseQueryOptions } from '@tanstack/react-query'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

type UseQueryGenericOptions = Partial<
  Pick<
    UseQueryOptions<any>,
    | 'refetchOnMount'
    | 'refetchOnWindowFocus'
    | 'refetchOnReconnect'
    | 'staleTime'
    | 'refetchInterval'
    | 'refetchIntervalInBackground'
    | 'meta'
  >
>

/** Every query category that can be targeted by `useRefetchQueriesByCategory`. */
export const queryCategories = ['price'] as const

/**
 * Classes of queries that can be invalidated together by tagging them with
 * `meta.category`, regardless of their key shape (see
 * `useRefetchQueriesByCategory`).
 */
export type QueryCategory = (typeof queryCategories)[number]

export const noRefetchQueryOptions: UseQueryGenericOptions = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

export const persistQueryStaleTime = 30_000

export const persistQueryOptions: UseQueryGenericOptions = {
  meta: { shouldPersist: true },
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: persistQueryStaleTime,
}

export const priceQueryStaleTime = convertDuration(1, 'min', 'ms')

export const priceQueryRefetchInterval = convertDuration(5, 'min', 'ms')

/**
 * Persisted queries whose data drifts over time (prices): cached data still
 * renders instantly, but staleness is respected — data older than
 * `priceQueryStaleTime` refetches on mount/focus/reconnect, and a foreground
 * interval keeps long-lived windows current. Tagged with the `price` category
 * so refresh buttons can invalidate every price source at once.
 */
export const pricePersistQueryOptions: UseQueryGenericOptions = {
  meta: { shouldPersist: true, category: 'price' },
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: priceQueryStaleTime,
  refetchInterval: priceQueryRefetchInterval,
  refetchIntervalInBackground: false,
}

export const balanceQueryStaleTime = convertDuration(1, 'min', 'ms')

export const balanceQueryRefetchInterval = convertDuration(2, 'min', 'ms')

/**
 * Persisted balance queries: cached amounts render instantly, but staleness is
 * respected so balances renew without a manual refresh.
 *
 * `staleTime` is load-bearing rather than cosmetic. The extension popup tears
 * down its whole React tree on close, so every open is a remount — with
 * `refetchOnMount` enabled and no throttle, opening the popup twice in a row
 * would fan out a full balance refresh each time. Persistence keeps
 * `dataUpdatedAt` across popup sessions, so `staleTime` becomes a real
 * cross-session throttle: the disk-backed equivalent of the in-memory interval
 * iOS gets from `throttledOnAppear`.
 *
 * `refetchIntervalInBackground` stays false so a backgrounded desktop window
 * does not keep fanning out RPCs; the interval exists for long-lived windows
 * that neither remount nor regain focus.
 */
export const balancePersistQueryOptions: UseQueryGenericOptions = {
  meta: { shouldPersist: true },
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: balanceQueryStaleTime,
  refetchInterval: balanceQueryRefetchInterval,
  refetchIntervalInBackground: false,
}

export const liveBalanceQueryRefetchInterval = balanceQueryRefetchInterval

/**
 * Options layered onto persisted balance queries shown on a live wallet
 * surface. One-shot import scans deliberately do not use these options.
 *
 * Retained as an alias of `balancePersistQueryOptions` so live wallet surfaces
 * and the balance options they build on cannot drift apart.
 */
export const liveBalanceQueryOptions = balancePersistQueryOptions

export const pollingQueryOptions = (
  interval: number
): UseQueryGenericOptions => ({
  refetchInterval: interval,
  refetchIntervalInBackground: true,
})
