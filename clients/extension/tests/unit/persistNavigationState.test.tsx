// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { AppView } from '@clients/extension/src/navigation/AppView'
import { PersistNavigationState } from '@clients/extension/src/navigation/PersistNavigationState'

import { chromeMock } from './mocks/chrome'

const ethereum = { chain: Chain.Ethereum, id: 'ETH' }
const password = 'fast-vault-password'

const wrapper = ({ children }: { children: ReactNode }) => (
  <NavigationProvider initialValue={{ history: [{ id: 'vault' }] }}>
    <PersistNavigationState>{children}</PersistNavigationState>
  </NavigationProvider>
)

const getPersistedView = async () => {
  const { persistedView } = await chromeMock.storage.local.get('persistedView')
  return persistedView
}

describe('PersistNavigationState', () => {
  it('writes only allowlisted state and leaves the home view after goHome', async () => {
    const { result } = renderHook(() => useNavigate<AppView>(), { wrapper })

    act(() =>
      result.current({
        id: 'deposit',
        state: {
          coin: ethereum,
          action: 'delegate',
          form: { amount: '1' },
        },
      })
    )
    await waitFor(async () =>
      expect(await getPersistedView()).toEqual({
        id: 'deposit',
        state: { coin: ethereum, action: 'delegate' },
      })
    )

    act(() =>
      result.current({
        id: 'keysign',
        state: {
          securityType: 'fast',
          keysignPayload: { keysign: create(KeysignPayloadSchema) },
          password,
        },
      })
    )
    await waitFor(async () => expect(await getPersistedView()).toBeUndefined())

    act(() => result.current({ id: 'vault' }, { reset: true }))
    await waitFor(async () =>
      expect(await getPersistedView()).toEqual({ id: 'vault' })
    )
  })
})
