// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { ChildrenProp } from '@lib/ui/props'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it, vi } from 'vitest'

import type { KeysignAction, KeysignProgress } from '../state/keysignAction'

const { baseKeysignAction } = vi.hoisted(() => ({
  baseKeysignAction: vi.fn<KeysignAction>(),
}))

vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({}),
}))
vi.mock('@core/ui/mpc/keysign/action/state/keysignAction', () => ({
  useKeysignAction: () => baseKeysignAction,
}))
vi.mock('@core/ui/mpc/keysign/action/state/keysignMutationListener', () => ({
  useKeysignMutationListener: () => ({}),
}))
vi.mock('@vultisig/core-mpc/keysign/utils/getKeysignChain', () => ({
  getKeysignChain: () => 'Ethereum',
}))
// A CowSwap order that needs an approval signs both digests in one call,
// through the keysign action the mutation hands it.
vi.mock('../../cowswap/cowSwapKeysign', () => ({
  getCowSwapKeysignData: () => ({}),
  signCowSwapOrder: async ({
    keysignAction,
  }: {
    keysignAction: (input: { msgs: string[] }) => Promise<unknown>
  }) => {
    await keysignAction({ msgs: ['approve-hash', 'order-hash'] })
    return { txs: [] }
  },
}))

import { useKeysignMutation } from './useKeysignMutation'

describe('useKeysignMutation', () => {
  it('reports signature progress from the CowSwap signing path', async () => {
    baseKeysignAction.mockImplementation(async ({ msgs, onProgress }) => {
      msgs.forEach((_, index) =>
        onProgress?.({ done: index + 1, total: msgs.length })
      )
      return []
    })
    const onProgress = vi.fn<(progress: KeysignProgress) => void>()
    const onMessageCount = vi.fn<(count: number) => void>()
    const queryClient = new QueryClient()

    const { result } = renderHook(
      () =>
        useKeysignMutation({
          payload: { keysign: create(KeysignPayloadSchema) },
          onMessageCount,
          onProgress,
        }),
      {
        wrapper: ({ children }: ChildrenProp) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    )

    act(() => result.current.mutate())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(onMessageCount).toHaveBeenCalledWith(2)
    expect(onProgress.mock.calls).toEqual([
      [{ done: 1, total: 2 }],
      [{ done: 2, total: 2 }],
    ])
  })
})
