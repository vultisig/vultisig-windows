import { describe, expect, it } from 'vitest'

import {
  balancePersistQueryOptions,
  balanceQueryRefetchInterval,
  balanceQueryStaleTime,
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

describe('balancePersistQueryOptions', () => {
  it('persists balances but lets staleness drive refetches', () => {
    expect(balanceQueryStaleTime).toBe(60_000)
    expect(balanceQueryRefetchInterval).toBe(120_000)
    expect(balancePersistQueryOptions).toMatchObject({
      meta: { shouldPersist: true },
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: balanceQueryStaleTime,
      refetchInterval: balanceQueryRefetchInterval,
      refetchIntervalInBackground: false,
    })
  })

  it('is not tagged with a category, so refresh buttons cannot invalidate every vault at once', () => {
    expect(balancePersistQueryOptions.meta).not.toHaveProperty('category')
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
