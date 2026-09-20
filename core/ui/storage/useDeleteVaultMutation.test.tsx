// @vitest-environment happy-dom
/**
 * Refreshing the vault list after a delete makes another vault current, and
 * the tree under `RootCurrentVaultProvider` is withheld until that vault's
 * shares are read. A delete screen that only navigated once the refresh
 * landed was torn down before it could, so the screen came back for the
 * next vault (#4969). The caller's `onSuccess` therefore has to run before
 * the refresh and has to survive the calling component going away.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StorageKey } from './StorageKey'

const core = vi.hoisted(() => ({
  deleteVault: vi.fn(async () => {}),
}))

vi.mock('../state/core', () => ({ useCore: () => core }))

import { useDeleteVaultMutation } from './vaults'

const queryClient = new QueryClient()
const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useDeleteVaultMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs onSuccess before the vault list and coins are refetched', async () => {
    const onSuccess = vi.fn(() => {
      expect(invalidateQueries).not.toHaveBeenCalled()
    })
    const { result } = renderHook(() => useDeleteVaultMutation({ onSuccess }), {
      wrapper,
    })

    await result.current.mutateAsync('vault-id')

    expect(core.deleteVault).toHaveBeenCalledWith('vault-id')
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(
      invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey)
    ).toEqual([[StorageKey.vaults], [StorageKey.vaultsCoins]])
  })

  it('still runs onSuccess when the calling component unmounts before the delete settles', async () => {
    let settleDelete = () => {}
    core.deleteVault.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          settleDelete = resolve
        })
    )
    const onSuccess = vi.fn()
    const { result, unmount } = renderHook(
      () => useDeleteVaultMutation({ onSuccess }),
      { wrapper }
    )

    result.current.mutate('vault-id')
    await waitFor(() => expect(core.deleteVault).toHaveBeenCalledTimes(1))
    unmount()
    settleDelete()

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
  })
})
