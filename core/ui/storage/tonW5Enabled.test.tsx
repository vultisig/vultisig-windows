// @vitest-environment happy-dom
/**
 * The developer toggle's mutation must invalidate the flag query and the
 * coins query as two separate keys. Passing both in one array reads as a
 * single composite key that matches nothing, so storage changes while the
 * switch keeps showing the old value — the "stuck switch" regression.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { StorageKey } from './StorageKey'

const core = vi.hoisted(() => ({
  setIsTonW5Enabled: vi.fn(async () => {}),
  createCoin: vi.fn(async () => {}),
  deleteCoin: vi.fn(async () => {}),
}))

vi.mock('../state/core', () => ({ useCore: () => core }))
vi.mock('./vaults', () => ({ useVaults: () => [] }))
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))

import { useSetIsTonW5EnabledMutation } from './tonW5Enabled'

describe('useSetIsTonW5EnabledMutation', () => {
  it('persists the flag, then invalidates the flag and coins queries as separate keys', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useSetIsTonW5EnabledMutation(), {
      wrapper,
    })

    await result.current.mutateAsync(true)

    await waitFor(() => {
      expect(core.setIsTonW5Enabled).toHaveBeenCalledWith(true)
    })
    const invalidatedKeys = invalidateQueries.mock.calls.map(
      ([filters]) => filters?.queryKey
    )
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        [StorageKey.isTonW5Enabled],
        [StorageKey.vaultsCoins],
      ])
    )
    expect(invalidatedKeys).not.toContainEqual([
      StorageKey.isTonW5Enabled,
      StorageKey.vaultsCoins,
    ])
  })
})
