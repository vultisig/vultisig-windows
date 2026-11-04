// @vitest-environment happy-dom
/**
 * The extension's dApp popup hosts the core app without a navigation stack:
 * it renders a single resolver instead of an ActiveView, and the core state's
 * goBack/goHome close the window. RootCurrentVaultProvider sits in that shell,
 * so it must resolve the current vault with no NavigationProvider above it,
 * and an unreadable vault there must land on the recovery page instead of
 * crashing the popup.
 */
import { PasscodeProvider } from '@core/ui/passcodeEncryption/state/passcode'
import { CurrentVaultIdProvider } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultsProvider } from '@core/ui/storage/vaults'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { View } from '@lib/ui/navigation/View'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { useContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      options?.name ? `${key}:${options.name}` : key,
  }),
}))

// The splash reaches the Lottie player, which needs a real canvas.
vi.mock('@core/ui/product/ProductLogoBlock', () => ({
  ProductLogoBlock: () => null,
}))

// Only the vault hooks are exercised; WalletCore's WASM is never loaded.
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))

const goBack = vi.hoisted(() => vi.fn())
const setCurrentVaultId = vi.hoisted(() => vi.fn(async () => {}))
const goHome = vi.hoisted(() => vi.fn())

vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({
    goBack,
    goHome,
    openUrl: () => {},
    version: 'test',
    getPasscodeEncryption: async () => null,
    setCurrentVaultId,
  }),
}))

const readVaultAllKeyShares = vi.hoisted(() => vi.fn())

vi.mock(
  '@core/ui/passcodeEncryption/core/vaultKeyShares',
  async importOriginal => {
    const actual =
      await importOriginal<
        typeof import('@core/ui/passcodeEncryption/core/vaultKeyShares')
      >()

    return { ...actual, readVaultAllKeyShares }
  }
)

import { UnreadableVaultKeySharesError } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import {
  CurrentVaultContext,
  RootCurrentVaultProvider,
  useUnreadableVaultRecoveryId,
} from '@core/ui/vault/state/currentVault'

const vault: Vault = {
  name: 'Popup vault',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['Mac-6001', 'Server-6002'],
  localPartyId: 'Mac-6001',
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const Probe = () => {
  const currentVault = useContext(CurrentVaultContext)
  const recoveryVaultId = useUnreadableVaultRecoveryId()

  if (currentVault) {
    return <span>{`vault:${currentVault.name}`}</span>
  }

  if (recoveryVaultId) {
    return <span>{`recovery:${recoveryVaultId}`}</span>
  }

  return <span>no-vault</span>
}

const otherVault: Vault = {
  ...vault,
  name: 'Other vault',
  publicKeys: { ecdsa: 'other-ecdsa-public-key', eddsa: 'other-eddsa' },
  order: 1,
}

const renderProvider = (history?: View[], extraVaults: Vault[] = []) => {
  const queryClient = new QueryClient()
  // StorageDependant settles storage before mounting the provider, and the
  // passcode hook asserts its query has data.
  queryClient.setQueryData([StorageKey.passcodeEncryption], null)
  queryClient.setQueryData([StorageKey.fiatCurrency], 'usd')

  const shell = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <VaultsProvider
          value={[vault, ...extraVaults].map(v => ({ ...v, coins: [] }))}
        >
          <CurrentVaultIdProvider value={getVaultId(vault)}>
            <PasscodeProvider initialValue={null}>
              <RootCurrentVaultProvider>
                <Probe />
              </RootCurrentVaultProvider>
            </PasscodeProvider>
          </CurrentVaultIdProvider>
        </VaultsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

  return render(
    history ? (
      <NavigationProvider initialValue={{ history }}>
        {shell}
      </NavigationProvider>
    ) : (
      shell
    )
  )
}

beforeEach(() => {
  readVaultAllKeyShares.mockReset()
  goBack.mockReset()
  setCurrentVaultId.mockClear()
  goHome.mockReset()
})

describe('RootCurrentVaultProvider without a NavigationProvider', () => {
  it('provides the current vault', async () => {
    readVaultAllKeyShares.mockResolvedValue({ keyShares: vault.keyShares })

    renderProvider()

    expect(await screen.findByText('vault:Popup vault')).toBeTruthy()
  })

  it('shows the recovery page with a close action for unreadable shares', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider()

    expect(
      await screen.findByText('vault_cannot_be_opened:Popup vault')
    ).toBeTruthy()
    expect(screen.queryByText('import_vult_backup')).toBeNull()

    fireEvent.click(screen.getByText('close'))

    expect(goBack).toHaveBeenCalledTimes(1)
  })
})

describe('UnreadableVaultRecovery', () => {
  it.each([
    ['without a NavigationProvider', undefined],
    ['with a NavigationProvider', [{ id: 'vault' }]],
  ])('names the vault and shows the cause %s', async (_host, history) => {
    readVaultAllKeyShares.mockRejectedValue(
      new UnreadableVaultKeySharesError(new Error('Invalid MPC keyshare'))
    )

    renderProvider(history)

    expect(
      await screen.findByText('vault_cannot_be_opened:Popup vault')
    ).toBeTruthy()

    fireEvent.click(screen.getByText('show_exact_error'))

    expect(await screen.findByText('Invalid MPC keyshare')).toBeTruthy()
  })
})

describe('switching away from an unreadable vault', () => {
  it('opens another vault from the recovery page', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider([{ id: 'vault' }], [otherVault])

    fireEvent.click(await screen.findByText('select_vault'))
    expect(screen.queryAllByText('Popup vault')).toHaveLength(0)
    fireEvent.click(await screen.findByText('Other vault'))

    await vi.waitFor(() =>
      expect(setCurrentVaultId).toHaveBeenCalledWith(getVaultId(otherVault))
    )
    await vi.waitFor(() => expect(goHome).toHaveBeenCalledTimes(1))
  })

  it('offers no switch when this is the only vault', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider([{ id: 'vault' }])

    expect(await screen.findByText('import_vult_backup')).toBeTruthy()
    expect(screen.queryByText('select_vault')).toBeNull()
  })

  it('offers no switch in the dApp popup', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider(undefined, [otherVault])

    expect(await screen.findByText('close')).toBeTruthy()
    expect(screen.queryByText('select_vault')).toBeNull()
  })
})

describe('RootCurrentVaultProvider with a NavigationProvider', () => {
  it('offers the backup import for unreadable shares', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider([{ id: 'vault' }])

    expect(await screen.findByText('import_vult_backup')).toBeTruthy()
    expect(screen.queryByText('close')).toBeNull()
  })

  it('lets the import flow through with the recovery id', async () => {
    readVaultAllKeyShares.mockRejectedValue(new UnreadableVaultKeySharesError())

    renderProvider([{ id: 'importVault' }])

    expect(await screen.findByText('recovery:ecdsa-public-key')).toBeTruthy()
  })
})
