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
  useTranslation: () => ({ t: (key: string) => key }),
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

vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({
    goBack,
    openUrl: () => {},
    version: 'test',
    getPasscodeEncryption: async () => null,
    setCurrentVaultId: async () => {},
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

const renderProvider = (history?: View[]) => {
  const queryClient = new QueryClient()
  // StorageDependant settles storage before mounting the provider, and the
  // passcode hook asserts its query has data.
  queryClient.setQueryData([StorageKey.passcodeEncryption], null)

  const shell = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <VaultsProvider value={[{ ...vault, coins: [] }]}>
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

    expect(await screen.findByText('vault_cannot_be_opened')).toBeTruthy()
    expect(screen.queryByText('import_vult_backup')).toBeNull()

    fireEvent.click(screen.getByText('close'))

    expect(goBack).toHaveBeenCalledTimes(1)
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
