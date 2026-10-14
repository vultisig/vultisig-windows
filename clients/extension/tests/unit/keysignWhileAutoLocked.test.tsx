// @vitest-environment happy-dom
/**
 * Regression test for the keysign side of
 * https://github.com/vultisig/vultisig-windows/issues/5018: since the passcode
 * lock no longer unmounts the vault tree, a keysign whose signing step mounts
 * while the lock is up reads the stored, still-encrypted key shares and fails.
 * A secure keysign advances on its own once its co-signers join, so a user
 * idle on the QR code past the auto-lock interval hit exactly that.
 *
 * Pinned down here: the auto-lock defers for as long as a keysign started on
 * this device is mounted, the way it does for a keygen (#4598), and fires one
 * interval after the flow is gone.
 */
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { PasscodeAutoLock } from '@core/ui/passcodeEncryption/autoLock/PasscodeAutoLock'
import { PasscodeAutoLockHoldsProvider } from '@core/ui/passcodeEncryption/autoLock/passcodeAutoLockHolds'
import {
  PasscodeProvider,
  usePasscode,
} from '@core/ui/passcodeEncryption/state/passcode'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({
    mpcDevice: 'extension',
    getPasscodeAutoLock: async () => 1,
    setPasscodeUnlockSession: async () => {},
  }),
}))

// The providers only read the local party id off the current vault.
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({ localPartyId: 'device-1' }),
}))

const passcode = '135790'

const autoLockMs = 60_000

const PasscodeProbe = () => {
  const [value] = usePasscode()

  return <span data-testid="passcode-probe">{String(value)}</span>
}

const observedPasscode = () => screen.getByTestId('passcode-probe').textContent

const makeQueryClient = () => {
  const queryClient = new QueryClient()

  queryClient.setQueryData([StorageKey.passcodeAutoLock], 1)

  return queryClient
}

afterEach(() => {
  vi.useRealTimers()
})

describe('auto-lock holds while a keysign flow is mounted', () => {
  const queryClient = makeQueryClient()

  const renderAutoLock = (withKeysignFlow: boolean) => (
    <QueryClientProvider client={queryClient}>
      <PasscodeProvider initialValue={passcode}>
        <PasscodeAutoLockHoldsProvider>
          <PasscodeAutoLock />
          <PasscodeProbe />
          {withKeysignFlow && (
            <StartKeysignProviders>
              <div />
            </StartKeysignProviders>
          )}
        </PasscodeAutoLockHoldsProvider>
      </PasscodeProvider>
    </QueryClientProvider>
  )

  it('locks after the interval when no keysign flow is mounted', () => {
    vi.useFakeTimers()

    render(renderAutoLock(false))

    act(() => {
      vi.advanceTimersByTime(autoLockMs + 1)
    })

    expect(observedPasscode()).toBe('null')
  })

  it('keeps the passcode while waiting on co-signers, then locks one interval after the flow unmounts', () => {
    vi.useFakeTimers()

    const { rerender } = render(renderAutoLock(true))

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(autoLockMs + 1)
      })
      expect(observedPasscode()).toBe(passcode)
    }

    rerender(renderAutoLock(false))

    act(() => {
      vi.advanceTimersByTime(autoLockMs + 1)
    })

    expect(observedPasscode()).toBe('null')
  })
})
