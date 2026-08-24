import { describe, expect, it } from 'vitest'

import {
  liveBalanceQueryOptions,
  liveBalanceQueryRefetchInterval,
  persistQueryOptions,
  persistQueryStaleTime,
  pricePersistQueryOptions,
  priceQueryRefetchInterval,
  priceQueryStaleTime,
  queryCategories,
} from './options'

describe('persistQueryOptions', () => {
  it('keeps persisted queries fresh briefly without focus or remount refetches', () => {
    expect(persistQueryStaleTime).toBe(30_000)
    expect(persistQueryOptions).toMatchObject({
      meta: { shouldPersist: true },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: persistQueryStaleTime,
    })
  })
})

describe('liveBalanceQueryOptions', () => {
  it('always verifies reopened balances and polls only live wallet observers', () => {
    expect(liveBalanceQueryRefetchInterval).toBe(30_000)
    expect(liveBalanceQueryOptions).toMatchObject({
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: persistQueryStaleTime,
      refetchInterval: liveBalanceQueryRefetchInterval,
      refetchIntervalInBackground: false,
    })
  })
})

describe('pricePersistQueryOptions', () => {
  it('persists price data but respects staleness so stale or poisoned caches self-heal', () => {
    expect(priceQueryStaleTime).toBe(60_000)
    expect(priceQueryRefetchInterval).toBe(300_000)
    expect(queryCategories).toContain(pricePersistQueryOptions.meta?.category)
    expect(pricePersistQueryOptions).toMatchObject({
      meta: { shouldPersist: true, category: 'price' },
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: priceQueryStaleTime,
      refetchInterval: priceQueryRefetchInterval,
      refetchIntervalInBackground: false,
    })
  })
})
