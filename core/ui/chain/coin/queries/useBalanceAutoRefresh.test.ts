import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getLiveBalanceQueryOptions } from './useBalancesQuery'

const input = {
  chain: Chain.Bitcoin,
  address: 'bc1qvault',
} as const

describe('live persisted balance refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refetches even a fresh hydrated balance when the popup remounts', async () => {
    const queryClient = new QueryClient()
    const options = getLiveBalanceQueryOptions(input)
    queryClient.setQueryData(options.queryKey, { balance: 1n })
    const queryFn = vi.fn().mockResolvedValue({ balance: 2n })
    const observer = new QueryObserver(queryClient, { ...options, queryFn })

    const unsubscribe = observer.subscribe(() => undefined)
    await vi.advanceTimersByTimeAsync(0)

    expect(queryFn).toHaveBeenCalledTimes(1)
    expect(observer.getCurrentResult().data).toEqual({ balance: 2n })

    unsubscribe()
    queryClient.clear()
  })
})
