// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Query } from '../Query'
import { useTransformQueryDataAsync } from './useTransformQueryData'

const resolvedSource: Query<{ payload: string }> = {
  data: { payload: 'keysign-payload' },
  error: null,
  isPending: false,
  isPlaceholderData: false,
}

describe('useTransformQueryDataAsync', () => {
  it('serves a remount on the same source data from cache instead of running the transform again (#4956)', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    // Mimics a transform that reads live state, like an L1 fee oracle: every
    // run would produce a different figure.
    let runs = 0
    const transform = vi.fn(async () => {
      runs += 1
      return runs
    })
    const useFee = () =>
      useTransformQueryDataAsync(resolvedSource, transform, ['fee'])

    const form = renderHook(useFee, { wrapper })
    await waitFor(() => expect(form.result.current.data).toBe(1))
    form.unmount()

    const overview = renderHook(useFee, { wrapper })
    await waitFor(() => expect(overview.result.current.isPending).toBe(false))

    expect(overview.result.current.data).toBe(1)
    expect(transform).toHaveBeenCalledTimes(1)
  })

  it('recomputes when the source data changes', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const transform = vi.fn(async ({ payload }: { payload: string }) =>
      payload.toUpperCase()
    )

    const { result, rerender } = renderHook(
      (source: Query<{ payload: string }>) =>
        useTransformQueryDataAsync(source, transform, ['fee']),
      { wrapper, initialProps: resolvedSource }
    )
    await waitFor(() => expect(result.current.data).toBe('KEYSIGN-PAYLOAD'))

    rerender({ ...resolvedSource, data: { payload: 'refreshed-payload' } })
    await waitFor(() => expect(result.current.data).toBe('REFRESHED-PAYLOAD'))

    expect(transform).toHaveBeenCalledTimes(2)
  })
})
