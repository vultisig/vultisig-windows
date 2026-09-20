// @vitest-environment happy-dom
/**
 * Deleting a vault while another exists makes that other vault current, and
 * the tree under `RootCurrentVaultProvider` is withheld until its shares are
 * read, which unmounts this page while the delete is still settling. The
 * page has to leave for the vaults list anyway; before #4969 it came back
 * for the next vault instead.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const makeVault = (name: string): Vault => ({
  name,
  publicKeys: { ecdsa: `${name}-ecdsa`, eddsa: `${name}-eddsa` },
  keyShares: { ecdsa: 'share', eddsa: 'share' },
  hexChainCode: 'chain-code',
  signers: ['Mac-6001', 'Mac-6002'],
  localPartyId: 'Mac-6001',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
})

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  deleteVault: vi.fn(async () => {}),
  vaults: [] as Vault[],
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
// The button's spinner is a Rive animation whose runtime fetches its wasm on
// import; nothing here needs it.
vi.mock('@lib/ui/loaders/Spinner', () => ({ Spinner: () => null }))
vi.mock('@core/ui/navigation/hooks/useCoreNavigate', () => ({
  useCoreNavigate: () => mocks.navigate,
}))
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ deleteVault: mocks.deleteVault, goBack: () => {} }),
}))
vi.mock('@core/ui/storage/fiatCurrency', () => ({
  useFiatCurrency: () => 'usd',
}))
vi.mock('@core/ui/vault/queries/useVaultTotalBalanceQuery', () => ({
  useVaultTotalBalanceQuery: () => ({ data: 0 }),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => mocks.vaults[0],
}))
vi.mock('@core/ui/storage/vaults', async importOriginal => ({
  ...(await importOriginal<typeof import('@core/ui/storage/vaults')>()),
  useVaults: () => mocks.vaults,
}))

import { DeleteVaultPage } from '.'

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={darkTheme}>
        <DeleteVaultPage />
      </ThemeProvider>
    </QueryClientProvider>
  )

const acceptTermsAndDelete = () => {
  screen.getAllByRole('checkbox').forEach(checkbox => fireEvent.click(checkbox))
  fireEvent.click(screen.getByTestId('delete-vault-button'))
}

describe('DeleteVaultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('leaves for the vaults list even when the page is torn down before the delete settles', async () => {
    const [vault, other] = [makeVault('first'), makeVault('second')]
    mocks.vaults = [vault, other]
    let settleDelete = () => {}
    mocks.deleteVault.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          settleDelete = resolve
        })
    )

    const { unmount } = renderPage()
    acceptTermsAndDelete()
    await waitFor(() =>
      expect(mocks.deleteVault).toHaveBeenCalledWith(getVaultId(vault))
    )
    expect(mocks.navigate).not.toHaveBeenCalled()

    unmount()
    settleDelete()

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ id: 'vaults' })
    )
    expect(mocks.navigate).toHaveBeenCalledTimes(1)
  })

  it('leaves for the new vault screen once when the last vault goes', async () => {
    mocks.vaults = [makeVault('only')]

    renderPage()
    acceptTermsAndDelete()

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ id: 'newVault' })
    )
    expect(mocks.navigate).toHaveBeenCalledTimes(1)
  })

  it('keeps the delete disabled until every term is accepted', () => {
    mocks.vaults = [makeVault('only')]

    renderPage()
    const isDeleteDisabled = () =>
      screen.getByTestId('delete-vault-button').hasAttribute('disabled')
    const [first, ...rest] = screen.getAllByRole('checkbox')
    fireEvent.click(first)

    expect(isDeleteDisabled()).toBe(true)

    rest.forEach(checkbox => fireEvent.click(checkbox))

    expect(isDeleteDisabled()).toBe(false)
  })
})
