// @vitest-environment happy-dom
/**
 * Leaving an unreadable vault for another one must never bring back the tree
 * of a vault that was proven earlier, even when a vault-writing view is on
 * top of the navigation stack.
 */
import {
  RootCurrentVaultProvider,
  useCurrentVault,
} from '@core/ui/vault/state/currentVault'
import { act, render, screen } from '@testing-library/react'
import type { Vault, VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import React from 'react'
import { beforeEach, expect, it, vi } from 'vitest'

const storage: { vaults: Vault[]; currentVaultId: string | null } = {
  vaults: [],
  currentVaultId: null,
}

const readCalls: Array<{
  resolve: (shares: VaultAllKeyShares) => void
  reject: (error: unknown) => void
}> = []
let currentViewId = 'setupFastVault'

vi.mock('@core/ui/product/ProductLogoBlock', () => ({
  ProductLogoBlock: () => <div data-testid="splash" />,
}))
vi.mock('@core/ui/vault/state/UnreadableVaultRecovery', () => ({
  UnreadableVaultRecovery: ({ name }: { name: string }) => (
    <div data-testid="recovery">{name}</div>
  ),
}))
vi.mock('@core/ui/state/core', () => ({ useCore: () => ({}) }))
vi.mock('@lib/ui/navigation/state', () => ({
  useOptionalNavigationHistory: () => [{ id: currentViewId }],
}))
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))
vi.mock('@core/ui/passcodeEncryption/state/passcode', () => ({
  usePasscode: () => [null],
}))
vi.mock('@core/ui/passcodeEncryption/state/useIsPasscodeRequired', () => ({
  useIsPasscodeRequired: () => false,
}))
vi.mock('@core/ui/storage/vaults', () => ({
  useVaults: () => storage.vaults,
}))
vi.mock('@core/ui/storage/currentVaultId', () => ({
  useCurrentVaultId: () => storage.currentVaultId,
}))
vi.mock('@core/ui/passcodeEncryption/core/vaultKeyShares', () => ({
  UnreadableVaultKeySharesError: class extends Error {},
  readVaultAllKeyShares: () =>
    new Promise<VaultAllKeyShares>((resolve, reject) => {
      readCalls.push({ resolve, reject })
    }),
}))

import { UnreadableVaultKeySharesError } from '@core/ui/passcodeEncryption/core/vaultKeyShares'

const makeVault = (id: string, name: string): Vault => ({
  name,
  publicKeys: { ecdsa: id, eddsa: `${id}-eddsa` },
  signers: ['Server-1', 'Device-1'],
  localPartyId: 'Device-1',
  hexChainCode: '0x123',
  keyShares: { ecdsa: `${id}-stored`, eddsa: `${id}-stored-eddsa` },
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
})

const VaultProbe = () => {
  const vault = useCurrentVault()
  return <div data-testid="vault-tree">{vault.name}</div>
}

const settle = () => act(async () => void (await Promise.resolve()))

beforeEach(() => {
  storage.vaults = []
  storage.currentVaultId = null
  readCalls.length = 0
  currentViewId = 'setupFastVault'
})

it('does not revive a held vault when switching from recovery in a vault-writing view', async () => {
  const first = makeVault('vault-a', 'Vault A')
  const unreadable = makeVault('vault-b', 'Vault B')
  const picked = makeVault('vault-c', 'Vault C')
  storage.vaults = [first, unreadable, picked]
  storage.currentVaultId = 'vault-a'

  const view = render(
    <RootCurrentVaultProvider>
      <VaultProbe />
    </RootCurrentVaultProvider>
  )
  await settle()
  await act(async () => {
    readCalls[0].resolve({
      keyShares: { ecdsa: 'vault-a-proven', eddsa: 'vault-a-proven-eddsa' },
    })
  })
  expect(screen.getByTestId('vault-tree').textContent).toBe('Vault A')

  storage.currentVaultId = 'vault-b'
  view.rerender(
    <RootCurrentVaultProvider>
      <VaultProbe />
    </RootCurrentVaultProvider>
  )
  await settle()
  await act(async () => {
    readCalls[1].reject(new UnreadableVaultKeySharesError())
  })
  expect(screen.getByTestId('recovery').textContent).toBe('Vault B')

  storage.currentVaultId = 'vault-c'
  view.rerender(
    <RootCurrentVaultProvider>
      <VaultProbe />
    </RootCurrentVaultProvider>
  )
  await settle()

  expect(screen.queryByTestId('vault-tree')).toBeNull()
  expect(screen.getByTestId('splash')).toBeDefined()
})

it('lands on the picked vault recovery when the picked vault is unreadable', async () => {
  currentViewId = 'vault'
  const first = makeVault('vault-a', 'Vault A')
  const picked = makeVault('vault-b', 'Vault B')
  storage.vaults = [first, picked]
  storage.currentVaultId = 'vault-a'

  const view = render(
    <RootCurrentVaultProvider>
      <VaultProbe />
    </RootCurrentVaultProvider>
  )
  await settle()
  await act(async () => {
    readCalls[0].reject(new UnreadableVaultKeySharesError())
  })
  expect(screen.getByTestId('recovery').textContent).toBe('Vault A')

  storage.currentVaultId = 'vault-b'
  view.rerender(
    <RootCurrentVaultProvider>
      <VaultProbe />
    </RootCurrentVaultProvider>
  )
  await settle()
  expect(screen.getByTestId('splash')).toBeDefined()

  await act(async () => {
    readCalls[1].reject(new UnreadableVaultKeySharesError())
  })
  expect(screen.getByTestId('recovery').textContent).toBe('Vault B')
})
