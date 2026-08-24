import { balancePersistQueryOptions } from '@lib/ui/query/utils/options'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

const key = ['coinBalance', { chain: 'Ethereum', id: 'usdt', address: '0x1' }]

// The vault page stays mounted underneath the keysign flow, so its balance
// observer is live when a broadcast fires. Reading the chain at that moment
// re-caches the pre-transaction amount and restarts its freshness window,
// which pinned the stale figure for a whole `staleTime` (issue #4690).
describe('balance invalidation at broadcast', () => {
  const setup = () => {
    const onchain = { value: 0n }
    const queryFn = vi.fn().mockImplementation(async () => ({
      v: onchain.value,
    }))
    const options = { queryKey: key, queryFn, ...balancePersistQueryOptions }
    const queryClient = new QueryClient()

    return { onchain, queryFn, options, queryClient }
  }

  it('does not re-read the chain while the vault page is mounted', async () => {
    const { queryFn, options, queryClient } = setup()

    const observer = new QueryObserver(queryClient, options)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().isSuccess).toBe(true)
    )
    expect(queryFn).toHaveBeenCalledTimes(1)

    await queryClient.invalidateQueries({
      queryKey: key,
      refetchType: 'none',
    })

    expect(queryFn).toHaveBeenCalledTimes(1)
    expect(
      queryClient.getQueryCache().find({ queryKey: key })?.state.isInvalidated
    ).toBe(true)
    unsubscribe()
  })

  it('surfaces the post-transaction amount once confirmation refetches', async () => {
    const { onchain, options, queryClient } = setup()

    const observer = new QueryObserver(queryClient, options)
    const unsubscribe = observer.subscribe(() => {})
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().isSuccess).toBe(true)
    )

    await queryClient.invalidateQueries({ queryKey: key, refetchType: 'none' })
    onchain.value = 500n

    await queryClient.invalidateQueries({ queryKey: key })
    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data?.v).toBe(500n)
    )
    unsubscribe()
  })
})
