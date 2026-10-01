// @vitest-environment happy-dom
/**
 * The opt-in fast-vault password cache must survive a popup reopen, and must not
 * survive a passcode lock (#4658). Both hang off one `isLocked` expression in
 * `PasscodeGuard`, and the passcode state always starts empty while the unlock
 * session is restored, so the two cases are pinned together here.
 */
import {
  cacheVaultPassword,
  clearVaultPasswordCache,
  getCachedVaultPassword,
} from '@core/ui/mpc/fast/passwordCache'
import { PasscodeGuard } from '@core/ui/passcodeEncryption/guard/PasscodeGuard'
import { PasscodeProvider } from '@core/ui/passcodeEncryption/state/passcode'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { PasscodeUnlockSession } from '@core/ui/storage/passcodeUnlockSession'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/ui/product/StartupPlaceholder', () => ({
  StartupPlaceholder: () => null,
}))
vi.mock('@core/ui/passcodeEncryption/autoLock/PasscodeAutoLock', () => ({
  PasscodeAutoLock: () => null,
}))
vi.mock('@core/ui/passcodeEncryption/guard/EnterPasscode', () => ({
  EnterPasscode: () => null,
}))
vi.mock('@core/ui/passcodeEncryption/guard/PasscodeEncryptionUpgrade', () => ({
  PasscodeEncryptionUpgrade: () => null,
}))
vi.mock('@core/ui/passcodeEncryption/state/useIsPasscodeRequired', () => ({
  useIsPasscodeRequired: () => true,
}))
vi.mock('@core/ui/passcodeEncryption/core/passcodeLock', async importOriginal => ({
  ...(await importOriginal<
    typeof import('@core/ui/passcodeEncryption/core/passcodeLock')
  >()),
  verifyPasscode: async () => true,
}))

const storage = vi.hoisted<{
  session: PasscodeUnlockSession | null
  sessionWrites: number
}>(() => ({ session: null, sessionWrites: 0 }))

const core = {
  canPersistPasscodeUnlockSession: true,
  getPasscodeUnlockSession: async () => storage.session,
  setPasscodeUnlockSession: async (value: PasscodeUnlockSession) => {
    storage.session = value
    storage.sessionWrites += 1
  },
  clearPasscodeUnlockSession: async () => {
    storage.session = null
  },
  getPasscodeEncryption: async () => ({ encryptedSample: 'encrypted-sample' }),
  getVaults: async () => [],
  getPasscodeAutoLock: async () => null,
}

vi.mock('@core/ui/state/core', () => ({ useCore: () => core }))

const vaultId = '02a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
const password = 'vault-password'

const renderGuard = () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData([StorageKey.passcodeAutoLock], null)

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <PasscodeProvider initialValue={null}>
          <PasscodeGuard />
        </PasscodeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  storage.session = null
  storage.sessionWrites = 0
  await clearVaultPasswordCache()
})

afterEach(async () => {
  await clearVaultPasswordCache()
})

describe('fast vault password cache across a passcode unlock restore', () => {
  it('keeps the cached password when the unlock session restores', async () => {
    storage.session = { passcode: '135790', expiresAt: null }
    await cacheVaultPassword({ vaultId, password })

    renderGuard()

    // The session is rewritten once the restore has put the passcode back, which
    // is the first moment a mount-time clear would already have landed.
    await waitFor(() => expect(storage.sessionWrites).toBeGreaterThan(0))

    expect(await getCachedVaultPassword({ vaultId })).toBe(password)
  })

  it('drops the cached password when there is no unlock session to restore', async () => {
    await cacheVaultPassword({ vaultId, password })

    renderGuard()

    await waitFor(async () =>
      expect(await getCachedVaultPassword({ vaultId })).toBeNull()
    )
  })
})
