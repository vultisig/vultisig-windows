import { balanceQueryStaleTime } from '@lib/ui/query/utils/options'
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

  // Desktop retains this throttle; the extension explicitly invalidates its
  // portfolio after restoration rather than changing the shared options.
  it('leaves a still-fresh hydrated balance alone on a desktop remount', async () => {
    const queryClient = new QueryClient()
    const options = getLiveBalanceQueryOptions(input)
    queryClient.setQueryData(options.queryKey, { balance: 1n })
    const queryFn = vi.fn().mockResolvedValue({ balance: 2n })
    const observer = new QueryObserver(queryClient, { ...options, queryFn })

    const unsubscribe = observer.subscribe(() => undefined)
    await vi.advanceTimersByTimeAsync(0)

    expect(queryFn).not.toHaveBeenCalled()
    expect(observer.getCurrentResult().data).toEqual({ balance: 1n })

    unsubscribe()
    queryClient.clear()
  })

  it('refetches a hydrated balance that outlived the throttle', async () => {
    const queryClient = new QueryClient()
    const options = getLiveBalanceQueryOptions(input)
    queryClient.setQueryData(
      options.queryKey,
      { balance: 1n },
      {
        updatedAt: Date.now() - balanceQueryStaleTime - 1,
      }
    )
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
