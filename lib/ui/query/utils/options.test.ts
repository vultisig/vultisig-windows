import { describe, expect, it } from 'vitest'

import { persistQueryOptions, persistQueryStaleTime } from './options'

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
