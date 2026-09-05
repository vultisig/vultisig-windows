// @vitest-environment happy-dom
/**
 * Regression tests for
 * https://github.com/vultisig/vultisig-windows/issues/4832: `RootCurrentVaultProvider`
 * wraps the whole app, so replacing its children with the startup splash while
 * a vault's shares are unproven unmounts every screen under it. The fast vault
 * setup flow saves its vault mid-flow — right after the email code is accepted
 * — so that teardown dropped the user back on the vault name step, in a loop
 * that created an orphan vault per pass.
 *
 * Three guarantees are pinned down here:
 *
 * - a flow already running without a current vault survives the vault it just
 *   wrote becoming current
 * - the tree is still withheld before anything is on screen, so vault screens
 *   never render against unproven shares (the #4820 guarantee)
 * - a flow running with an existing vault survives a second vault being
 *   saved and becoming current, which is what a user with a vault already in
 *   storage actually hits
 * - a storage refetch that rebuilds an unchanged vault neither blanks nor
 *   remounts the tree, while genuinely different shares — or a change to
 *   whether they are encrypted — still do
 */
import { RootCurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { act, render, screen } from '@testing-library/react'
import type { Vault, VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage: {
  vaults: Vault[]
  currentVaultId: string | null
  hasPasscodeEncryption: boolean
  passcode: string | null
} = {
  vaults: [],
  currentVaultId: null,
  hasPasscodeEncryption: false,
  passcode: null,
}

let readCalls: {
  input: VaultAllKeyShares
  resolve: (shares: VaultAllKeyShares) => void
  reject: (error: unknown) => void
}[] = []

vi.mock('@core/ui/product/ProductLogoBlock', () => ({
  ProductLogoBlock: () => <div data-testid="splash" />,
}))

vi.mock('@core/ui/vault/state/UnreadableVaultRecovery', () => ({
  UnreadableVaultRecovery: () => <div data-testid="unreadable-recovery" />,
}))

// The provider only reads `validateLegacyVaultKeyShares` off the core state and
// passes it through to the share reader, which is stubbed below.
vi.mock('@core/ui/state/core', () => ({ useCore: () => ({}) }))

vi.mock('@lib/ui/navigation/state', () => ({
  useNavigation: () => [{ history: [{ id: 'setupFastVault' }] }],
}))

// Imported at module scope by `currentVault.tsx` for hooks this test does not
// exercise; loading it would pull in the WalletCore WASM.
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))

vi.mock('@core/ui/passcodeEncryption/state/passcode', () => ({
  usePasscode: () => [storage.passcode],
}))

vi.mock('@core/ui/passcodeEncryption/state/useIsPasscodeRequired', () => ({
  useIsPasscodeRequired: () => storage.hasPasscodeEncryption,
}))

vi.mock('@core/ui/storage/vaults', () => ({
  useVaults: () => storage.vaults,
}))

vi.mock('@core/ui/storage/currentVaultId', () => ({
  useCurrentVaultId: () => storage.currentVaultId,
}))

// Readability is resolved by hand so the window between "the vault is current"
// and "its shares are proven" can be held open across renders.
vi.mock('@core/ui/passcodeEncryption/core/vaultKeyShares', () => ({
  UnreadableVaultKeySharesError: class extends Error {},
  readVaultAllKeyShares: ({
    keyShares,
    chainKeyShares,
    keyShareMldsa,
  }: VaultAllKeyShares) =>
    new Promise<VaultAllKeyShares>((resolve, reject) => {
      readCalls.push({
        input: { keyShares, chainKeyShares, keyShareMldsa },
        resolve,
        reject,
      })
    }),
}))

const vaultId = 'ecdsa-public-key'
const secondVaultId = 'second-ecdsa-public-key'

const makeVault = (overrides: Partial<Vault> = {}): Vault => ({
  name: 'Vault #1',
  publicKeys: { ecdsa: vaultId, eddsa: 'eddsa-public-key' },
  signers: ['Server-1234', 'Mac-6001'],
  localPartyId: 'Mac-6001',
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'stored-ecdsa', eddsa: 'stored-eddsa' },
  libType: 'DKLS',
  isBackedUp: false,
  order: 0,
  ...overrides,
})

const provenShares: VaultAllKeyShares = {
  keyShares: { ecdsa: 'proven-ecdsa', eddsa: 'proven-eddsa' },
}

let mountCount = 0

// Stands in for a setup flow: `CreateFastVaultFlow` holds the name, email and
// password the user typed in a `ValueTransfer`, so a remount restarts it at the
// vault name step.
const SetupFlow = () => {
  useEffect(() => {
    mountCount += 1
  }, [])

  return (
    <ValueTransfer<string>
      from={({ onFinish }) => (
        <button onClick={() => onFinish('Vault #1')}>name your vault</button>
      )}
      to={({ value }) => <div>keygen for {value}</div>}
    />
  )
}

const renderTree = (children = <SetupFlow />) =>
  render(<RootCurrentVaultProvider>{children}</RootCurrentVaultProvider>)

const settle = () => act(async () => { await Promise.resolve() })

const resolveRead = async (shares = provenShares) => {
  const call = readCalls[readCalls.length - 1]
  expect(call).toBeDefined()
  await act(async () => {
    call.resolve(shares)
  })
}

describe('RootCurrentVaultProvider tree continuity', () => {
  beforeEach(() => {
    storage.vaults = []
    storage.currentVaultId = null
    storage.hasPasscodeEncryption = false
    storage.passcode = null
    readCalls = []
    mountCount = 0
  })

  it('keeps a running setup flow mounted when the vault it wrote becomes current', async () => {
    const { rerender } = renderTree()

    await act(async () => {
      screen.getByText('name your vault').click()
    })
    expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    expect(mountCount).toBe(1)

    // `SaveVaultStep` succeeded: the vault is in storage and is now current,
    // while its shares are still being proven.
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByText('keygen for Vault #1')).toBeDefined()

    await resolveRead()

    expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    expect(mountCount).toBe(1)
  })

  it('withholds the tree until a vault present from the first render is proven', async () => {
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    renderTree()
    await settle()

    expect(screen.getByTestId('splash')).toBeDefined()
    expect(screen.queryByText('name your vault')).toBeNull()
    expect(mountCount).toBe(0)

    await resolveRead()

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByText('name your vault')).toBeDefined()
    expect(mountCount).toBe(1)
  })

  it('survives a storage refetch that rebuilds the same vault', async () => {
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()
    expect(mountCount).toBe(1)

    // `useVaultsQuery` maps storage rows into fresh objects on every refetch,
    // so an unrelated write hands the provider a new object for the same vault.
    storage.vaults = [makeVault()]
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(mountCount).toBe(1)
  })

  it('withholds the tree when the shares themselves change', async () => {
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()
    expect(screen.getByText('name your vault')).toBeDefined()

    // A reshare keeps the vault id and replaces the share material.
    storage.vaults = [
      makeVault({ keyShares: { ecdsa: 'reshared-ecdsa', eddsa: 'reshared-eddsa' } }),
    ]
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.getByTestId('splash')).toBeDefined()
    expect(screen.queryByText('name your vault')).toBeNull()
  })
  it('holds the tree through re-renders while the saved vault is still unresolved', async () => {
    const { rerender } = renderTree()

    await act(async () => {
      screen.getByText('name your vault').click()
    })

    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    // The save fans out several storage writes, so the provider re-renders
    // more than once before the read it kicked off settles.
    for (let attempt = 0; attempt < 3; attempt++) {
      rerender(
        <RootCurrentVaultProvider>
          <SetupFlow />
        </RootCurrentVaultProvider>
      )
      await settle()

      expect(screen.queryByTestId('splash')).toBeNull()
      expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    }

    await resolveRead()

    expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    expect(mountCount).toBe(1)
  })

  it('withholds the tree when encryption is switched on over the same shares', async () => {
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()
    expect(screen.getByText('name your vault')).toBeDefined()

    // Same stored bytes, but they now have to be decrypted before they can be
    // provided, so the plaintext result proven a moment ago no longer applies.
    storage.hasPasscodeEncryption = true
    storage.passcode = 'passcode'
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.getByTestId('splash')).toBeDefined()
    expect(screen.queryByText('name your vault')).toBeNull()
  })
  it('keeps a running setup flow mounted when a second vault becomes current', async () => {
    // The common case: the user already has a vault, so the flow runs with one
    // current and the save switches the current vault rather than creating the
    // first one.
    storage.vaults = [makeVault()]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()

    await act(async () => {
      screen.getByText('name your vault').click()
    })
    expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    expect(mountCount).toBe(1)

    storage.vaults = [
      makeVault(),
      makeVault({
        name: 'Fast Vault #2',
        publicKeys: { ecdsa: secondVaultId, eddsa: 'second-eddsa-public-key' },
        keyShares: { ecdsa: 'second-ecdsa', eddsa: 'second-eddsa' },
      }),
    ]
    storage.currentVaultId = secondVaultId
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByText('keygen for Vault #1')).toBeDefined()

    await resolveRead({
      keyShares: { ecdsa: 'proven-second-ecdsa', eddsa: 'proven-second-eddsa' },
    })

    expect(screen.getByText('keygen for Vault #1')).toBeDefined()
    expect(mountCount).toBe(1)
  })
})
