// @vitest-environment happy-dom
/**
 * "Cache password for 5 min" is consent to keep a signing credential, so it has
 * to mean what the user left it at. `RootCurrentVaultProvider` rebuilds the
 * current vault object on every one of its renders, which is not a change to
 * the vault the tick was given for.
 */
import {
  clearVaultPasswordCache,
  getCachedVaultPassword,
} from '@core/ui/mpc/fast/passwordCache'
import { FastVaultPasswordModal } from '@core/ui/mpc/fast/FastVaultPasswordModal'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children?: ReactNode }) => children ?? null,
}))

const vaultId = '02a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'

const currentVault = vi.hoisted<{ value: { publicKeys: { ecdsa: string } } }>(
  () => ({ value: { publicKeys: { ecdsa: '' } } })
)

vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => currentVault.value,
}))

vi.mock('@vultisig/core-mpc/fast/api/getVaultFromServer', () => ({
  getVaultFromServer: async () => ({}),
}))

const password = 'vault-password'

const finished: string[] = []

const tree = (queryClient: QueryClient) => (
  <ThemeProvider theme={darkTheme}>
    <QueryClientProvider client={queryClient}>
      <FastVaultPasswordModal
        showModal
        description="description"
        onBack={() => {}}
        onFinish={async ({ password: finishedWith }) => {
          finished.push(finishedWith)
        }}
        withPasswordCache
      />
    </QueryClientProvider>
  </ThemeProvider>
)

// What a render of RootCurrentVaultProvider hands down: the same vault, spread
// into a new object.
const rebuildCurrentVault = () => {
  currentVault.value = { ...currentVault.value }
}

const cacheCheckbox = () =>
  screen.getByRole<HTMLInputElement>('checkbox', { hidden: true })

const submitPassword = async () => {
  fireEvent.change(screen.getByTestId('fast-vault-password-input'), {
    target: { value: password },
  })

  // The form validates asynchronously, and the button is disabled until it does.
  const submit = screen.getByTestId<HTMLButtonElement>('fast-vault-submit')
  await waitFor(() => expect(submit.disabled).toBe(false))

  fireEvent.click(submit)
}

beforeEach(async () => {
  finished.length = 0
  currentVault.value = { publicKeys: { ecdsa: vaultId } }
  await clearVaultPasswordCache()
})

afterEach(async () => {
  await clearVaultPasswordCache()
})

describe('fast vault password modal cache opt-in', () => {
  it('caches the password when the current vault object is rebuilt under it', async () => {
    const queryClient = new QueryClient()
    const { rerender } = render(tree(queryClient))

    fireEvent.click(cacheCheckbox())
    expect(cacheCheckbox().checked).toBe(true)

    rebuildCurrentVault()
    rerender(tree(queryClient))

    expect(cacheCheckbox().checked).toBe(true)

    await submitPassword()

    await waitFor(async () =>
      expect(await getCachedVaultPassword({ vaultId })).toBe(password)
    )
  })

  it('caches nothing when the tick is left alone', async () => {
    const queryClient = new QueryClient()
    render(tree(queryClient))

    expect(cacheCheckbox().checked).toBe(false)

    await submitPassword()

    await waitFor(() => expect(finished).toHaveLength(1))

    expect(await getCachedVaultPassword({ vaultId })).toBeNull()
  })
})
