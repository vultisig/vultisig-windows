// @vitest-environment happy-dom

import { passcodeEncryptionStorage } from '@core/extension/storage/passcodeEncryption'
import { vaultsStorage } from '@core/extension/storage/vaults'
import {
  type PasscodeAttemptState,
  withPasscodeOperationLock,
} from '@core/ui/passcodeEncryption/core/passcodeAttemptThrottle'
import { EnterPasscode } from '@core/ui/passcodeEncryption/guard/EnterPasscode'
import {
  PasscodeProvider,
  usePasscode,
} from '@core/ui/passcodeEncryption/state/passcode'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const legacyPasscode = '1357'
const legacySample = 'bGVnYWN5LXNhbXBsZQ=='

// The decryptions the lock screen asked for, and the ones held open until the
// test releases them, so overlapping checks can be ordered deterministically.
const cipher = vi.hoisted(() => {
  const decrypted: string[] = []
  const holds = new Map<string, Promise<void>>()
  const releases: Array<() => void> = []

  return { decrypted, holds, releases }
})

vi.mock(
  '@core/ui/passcodeEncryption/core/passcodeCipher',
  async importOriginal => ({
    ...(await importOriginal<
      typeof import('@core/ui/passcodeEncryption/core/passcodeCipher')
    >()),
    decryptWithPasscode: async ({
      passcode,
      values,
    }: {
      passcode: string
      values: Buffer[]
    }) => {
      cipher.decrypted.push(passcode)
      await cipher.holds.get(passcode)

      if (passcode !== legacyPasscode) {
        throw new Error('Wrong passcode')
      }

      return values
    },
  })
)

vi.mock('lottie-react', () => ({ default: () => null }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en', resolvedLanguage: 'en' },
    t: (key: string) => key,
  }),
  Trans: ({ children }: { children?: ReactNode }) => children ?? null,
}))

vi.mock('@core/ui/passcodeEncryption/manage/PasscodeInput', () => ({
  PasscodeInput: ({
    length,
    onChange,
    validation,
    value,
  }: {
    length: number
    onChange: (value: string | null) => void
    validation?: string
    value: string | null
  }) => (
    <input
      data-testid="passcode-input"
      data-length={length}
      data-validation={validation ?? ''}
      onChange={event => onChange(event.target.value || null)}
      value={value ?? ''}
    />
  ),
}))

const coreHolder: { value: Record<string, unknown> | undefined } = vi.hoisted(
  () => ({ value: undefined })
)

vi.mock('@core/ui/state/core', () => ({
  useCore: () => shouldBePresent(coreHolder.value),
}))

coreHolder.value = {
  ...vaultsStorage,
  ...passcodeEncryptionStorage,
}

/** Mirrors PasscodeGuard: the lock screen unmounts once a passcode is held. */
const LockScreen = () => {
  const [passcode] = usePasscode()

  return passcode ? (
    <span data-testid="unlocked-passcode">{passcode}</span>
  ) : (
    <EnterPasscode />
  )
}

const installWebLocks = () => {
  let queue: Promise<unknown> = Promise.resolve()

  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: (_name: string, operation: () => Promise<unknown>) => {
        const result = queue.then(() => operation())
        queue = result.catch(() => {})
        return result
      },
    },
  })
}

const removeWebLocks = () => {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: undefined,
  })
}

const holdDecryption = (passcode: string) => {
  let release = () => {}
  cipher.holds.set(
    passcode,
    new Promise<void>(resolve => {
      release = resolve
    })
  )
  cipher.releases.push(release)

  return release
}

const renderLockScreen = async (attemptState?: PasscodeAttemptState) => {
  const passcodeEncryption = {
    encryptedSample: legacySample,
    ...(attemptState ? { attemptState } : {}),
  }

  await chrome.storage.local.set({ [StorageKey.vaults]: [] })
  await passcodeEncryptionStorage.setPasscodeEncryption(passcodeEncryption)

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData([StorageKey.passcodeEncryption], passcodeEncryption)

  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <PasscodeProvider initialValue={null}>
          <LockScreen />
        </PasscodeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

  return screen.getByTestId<HTMLInputElement>('passcode-input')
}

const enter = (input: HTMLInputElement, value: string) =>
  fireEvent.change(input, { target: { value } })

const typeDigits = (input: HTMLInputElement, passcode: string) => {
  for (let length = 1; length <= passcode.length; length += 1) {
    enter(input, passcode.slice(0, length))
  }
}

const waitForUnlock = () =>
  waitFor(() =>
    expect(screen.getByTestId('unlocked-passcode').textContent).toBe(
      legacyPasscode
    )
  )

const settlePasscodeOperations = async () => {
  await withPasscodeOperationLock(async () => {})
  await new Promise(resolve => setTimeout(resolve, 50))
}

const lockModes = [
  { name: 'with Web Locks', install: installWebLocks },
  { name: 'without Web Locks', install: removeWebLocks },
]

describe.each(lockModes)('EnterPasscode short legacy passcode $name', mode => {
  beforeEach(() => {
    mode.install()
  })

  afterEach(async () => {
    cipher.releases.forEach(release => release())
    await settlePasscodeOperations()
    cleanup()
    cipher.decrypted.length = 0
    cipher.holds.clear()
    cipher.releases.length = 0
    removeWebLocks()
  })

  it('unlocks a passcode shorter than five digits and records its length', async () => {
    const input = await renderLockScreen()

    expect(input.getAttribute('data-length')).toBe('5')
    typeDigits(input, legacyPasscode)

    await waitForUnlock()
    await settlePasscodeOperations()

    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: legacySample,
      passcodeLength: legacyPasscode.length,
    })
  })

  it('does not charge failed short probes or interrupt typing', async () => {
    const input = await renderLockScreen()

    typeDigits(input, '2468')
    await settlePasscodeOperations()

    expect(cipher.decrypted).toEqual(['2', '24', '246', '2468'])
    expect(input.value).toBe('2468')
    expect(input.getAttribute('data-validation')).toBe('')
    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: legacySample,
    })
  })

  it('unlocks when typing continues past a short passcode that is still verifying', async () => {
    const releaseShort = holdDecryption(legacyPasscode)
    const releaseFull = holdDecryption(`${legacyPasscode}9`)
    const input = await renderLockScreen()

    typeDigits(input, legacyPasscode)
    await waitFor(() => expect(cipher.decrypted).toContain(legacyPasscode))
    enter(input, `${legacyPasscode}9`)

    releaseShort()
    await waitForUnlock()
    releaseFull()
    await settlePasscodeOperations()

    expect(cipher.decrypted).not.toContain(`${legacyPasscode}9`)
    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: legacySample,
      passcodeLength: legacyPasscode.length,
    })
  })

  it('does not charge or restore failures for an edit queued behind the unlock', async () => {
    const releaseShort = holdDecryption(legacyPasscode)
    const input = await renderLockScreen({
      failedAttempts: 5,
      lastFailedAt: Date.now() - 60_000,
    })

    typeDigits(input, legacyPasscode)
    await waitFor(() => expect(cipher.decrypted).toContain(legacyPasscode))
    enter(input, '135')
    enter(input, '1358')

    releaseShort()
    await waitForUnlock()
    await settlePasscodeOperations()

    expect(cipher.decrypted).not.toContain('1358')
    expect(await passcodeEncryptionStorage.getPasscodeEncryption()).toEqual({
      encryptedSample: legacySample,
      passcodeLength: legacyPasscode.length,
    })
  })
})
