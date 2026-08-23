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

export const liveBalanceQueryRefetchInterval = convertDuration(30, 's', 'ms')

/**
 * Options layered onto persisted balance queries shown on a live wallet
 * surface. The cached value renders immediately, every mount verifies it, and
 * a bounded foreground interval follows incoming or settling transactions.
 * One-shot import scans deliberately do not use these options.
 */
export const liveBalanceQueryOptions: UseQueryGenericOptions = {
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: persistQueryStaleTime,
  refetchInterval: liveBalanceQueryRefetchInterval,
  refetchIntervalInBackground: false,
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

export const pollingQueryOptions = (
  interval: number
): UseQueryGenericOptions => ({
  refetchInterval: interval,
  refetchIntervalInBackground: true,
})
