import { describe, expect, it } from 'vitest'

import {
  persistQueryOptions,
  persistQueryStaleTime,
  pricePersistQueryOptions,
  priceQueryRefetchInterval,
  priceQueryStaleTime,
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

describe('pricePersistQueryOptions', () => {
  it('persists price data but respects staleness so stale or poisoned caches self-heal', () => {
    expect(priceQueryStaleTime).toBe(60_000)
    expect(priceQueryRefetchInterval).toBe(300_000)
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
