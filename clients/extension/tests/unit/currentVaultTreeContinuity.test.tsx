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
 * The guarantees pinned down here:
 *
 * - a flow already running without a current vault survives the vault it just
 *   wrote becoming current
 * - the tree is still withheld before anything is on screen, so vault screens
 *   never render against unproven shares (the #4820 guarantee)
 * - a flow running with an existing vault survives a second vault being
 *   saved and becoming current, which is what a user with a vault already in
 *   storage actually hits
 * - that hold is limited to the views that write a vault: picking another
 *   existing vault anywhere else withholds the tree until it is proven, so no
 *   screen keeps showing the previous vault under the new id
 * - a vaults write that rebuilds the vault object neither blanks nor remounts
 *   the tree, while genuinely different shares — or a change to whether they
 *   are encrypted — still do
 * - a read is tagged with the inputs it was requested under, so shares
 *   replaced on the same object while it was in flight are never provided —
 *   and are re-read rather than leaving the tree withheld for good
 */
import { UnreadableVaultKeySharesError } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { RootCurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { act, render, screen } from '@testing-library/react'
import type { Vault, VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { Component, ReactNode, useEffect } from 'react'
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

// The view on top of the navigation history: a vault setup flow by default,
// the vault page for the ordinary vault switching cases.
let currentViewId = 'setupFastVault'

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
let validateLegacyVaultKeyShares: (() => Promise<void>) | undefined
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ validateLegacyVaultKeyShares }),
}))

vi.mock('@lib/ui/navigation/state', () => ({
  useOptionalNavigationHistory: () => [{ id: currentViewId }],
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

class ReadErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? (
      <div>vault read failed</div>
    ) : (
      this.props.children
    )
  }
}

const renderTree = (children = <SetupFlow />) =>
  render(<RootCurrentVaultProvider>{children}</RootCurrentVaultProvider>)

const settle = () =>
  act(async () => {
    await Promise.resolve()
  })

const resolveReadAt = async (index: number, shares = provenShares) => {
  const call = readCalls[index]
  expect(call).toBeDefined()
  await act(async () => {
    call.resolve(shares)
  })
}

const resolveRead = (shares = provenShares) =>
  resolveReadAt(readCalls.length - 1, shares)

describe('RootCurrentVaultProvider tree continuity', () => {
  beforeEach(() => {
    storage.vaults = []
    storage.currentVaultId = null
    storage.hasPasscodeEncryption = false
    storage.passcode = null
    currentViewId = 'setupFastVault'
    readCalls = []
    mountCount = 0
    validateLegacyVaultKeyShares = undefined
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

  it('survives a vaults write that rebuilds the vault object', async () => {
    const vault = makeVault()
    storage.vaults = [vault]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()
    expect(mountCount).toBe(1)

    // What a rename actually hands the provider. `useUpdateVaultMutation`
    // refetches `[StorageKey.vaults]`, and storage builds fresh objects on
    // every read — but React Query's structural sharing replaces only what
    // changed, and `mergeVaultsWithCoins` then spreads each vault into
    // `{...vault, coins}`. So the outer object is new while the share records
    // it was read from are the same ones.
    storage.vaults = [{ ...vault, name: 'Renamed' }]
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(mountCount).toBe(1)
    // Nothing readability depends on moved, so the shares are not read again.
    expect(readCalls).toHaveLength(1)
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
      makeVault({
        keyShares: { ecdsa: 'reshared-ecdsa', eddsa: 'reshared-eddsa' },
      }),
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

  it('withholds the tree when another existing vault is picked outside a setup flow', async () => {
    // The vault list switches the current vault and goes home. The vault page
    // must not keep rendering vault #1's data and actions under vault #2's id
    // while vault #2's shares are still being read.
    currentViewId = 'vault'
    const secondVault = makeVault({
      name: 'Vault #2',
      publicKeys: { ecdsa: secondVaultId, eddsa: 'second-eddsa-public-key' },
      keyShares: { ecdsa: 'second-ecdsa', eddsa: 'second-eddsa' },
    })
    storage.vaults = [makeVault(), secondVault]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    await resolveRead()
    expect(screen.getByText('name your vault')).toBeDefined()
    expect(mountCount).toBe(1)

    storage.currentVaultId = secondVaultId
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(screen.getByTestId('splash')).toBeDefined()
    expect(screen.queryByText('name your vault')).toBeNull()

    await resolveRead({
      keyShares: { ecdsa: 'proven-second-ecdsa', eddsa: 'proven-second-eddsa' },
    })

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByText('name your vault')).toBeDefined()
    expect(mountCount).toBe(2)
  })

  it('never provides a read whose shares were replaced on the same object while it was in flight', async () => {
    const vault = makeVault()
    storage.vaults = [vault]
    storage.currentVaultId = vaultId

    const { rerender } = renderTree()
    await settle()
    expect(readCalls).toHaveLength(1)
    expect(screen.getByTestId('splash')).toBeDefined()

    // The share material changes without the object identity changing, so the
    // result of the first read describes shares the vault no longer holds.
    // Observing the vault by reference alone would neither re-read nor ever
    // accept the in-flight result, leaving the app on the splash for good.
    vault.keyShares = { ecdsa: 'reshared-ecdsa', eddsa: 'reshared-eddsa' }
    rerender(
      <RootCurrentVaultProvider>
        <SetupFlow />
      </RootCurrentVaultProvider>
    )
    await settle()

    expect(readCalls).toHaveLength(2)
    expect(readCalls[1].input.keyShares).toEqual(vault.keyShares)

    await resolveReadAt(0)

    expect(screen.getByTestId('splash')).toBeDefined()
    expect(screen.queryByText('name your vault')).toBeNull()

    await resolveReadAt(1, {
      keyShares: {
        ecdsa: 'proven-reshared-ecdsa',
        eddsa: 'proven-reshared-eddsa',
      },
    })

    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByText('name your vault')).toBeDefined()
  })

  describe('passcode lock continuity (#5018)', () => {
    beforeEach(() => {
      currentViewId = 'vault'
      storage.vaults = [makeVault()]
      storage.currentVaultId = vaultId
      storage.hasPasscodeEncryption = true
      storage.passcode = '135790'
    })

    const rerenderTree = (rerender: ReturnType<typeof render>['rerender']) =>
      rerender(
        <RootCurrentVaultProvider>
          <SetupFlow />
        </RootCurrentVaultProvider>
      )

    it('preserves mounted state through repeated unchanged lock/unlock cycles without re-reading shares', async () => {
      const { rerender } = renderTree()
      await resolveRead()
      await act(async () => {
        screen.getByText('name your vault').click()
      })

      for (let cycle = 0; cycle < 2; cycle++) {
        storage.passcode = null
        rerenderTree(rerender)
        await settle()
        expect(screen.getByText('keygen for Vault #1')).toBeDefined()
        expect(screen.queryByTestId('splash')).toBeNull()

        storage.passcode = '135790'
        rerenderTree(rerender)
        await settle()
        expect(screen.getByText('keygen for Vault #1')).toBeDefined()
        expect(mountCount).toBe(1)
        expect(readCalls).toHaveLength(1)
      }
    })

    it('withholds a cold-start locked vault without reading its shares', async () => {
      storage.passcode = null
      renderTree()
      await settle()
      expect(screen.getByTestId('splash')).toBeDefined()
      expect(mountCount).toBe(0)
      expect(readCalls).toHaveLength(0)
    })

    it.each([
      'keysign',
      'joinKeysign',
      'signCustomMessage',
      'vaultBackup',
      undefined,
    ])(
      'tears down the %s view on lock instead of retaining signing/session callbacks',
      async viewId => {
        const { rerender } = renderTree()
        await resolveRead()
        currentViewId = viewId as string
        rerenderTree(rerender)
        storage.passcode = null
        rerenderTree(rerender)
        await settle()
        expect(screen.getByTestId('splash')).toBeDefined()
        expect(screen.queryByText('name your vault')).toBeNull()
      }
    )

    it('does not accept an in-flight read after locking an unproven vault', async () => {
      const { rerender } = renderTree()
      storage.passcode = null
      rerenderTree(rerender)
      await resolveReadAt(0)
      expect(screen.getByTestId('splash')).toBeDefined()
      expect(mountCount).toBe(0)
    })

    it('withholds navigation away from vault home while locked and discards the continuity proof', async () => {
      const { rerender } = renderTree()
      await resolveRead()
      storage.passcode = null
      rerenderTree(rerender)
      expect(screen.queryByTestId('splash')).toBeNull()

      currentViewId = 'keysign'
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
      currentViewId = 'vault'
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
    })

    it.each([
      ['key shares', { keyShares: { ecdsa: 'new', eddsa: 'new' } }],
      ['chain shares', { chainKeyShares: { Ethereum: 'new' } }],
      ['MLDSA share', { keyShareMldsa: 'new' }],
      ['public keys', { publicKeys: { ecdsa: vaultId, eddsa: 'new' } }],
      ['chain public keys', { chainPublicKeys: { Ethereum: 'new' } }],
      ['MLDSA public key', { publicKeyMldsa: 'new' }],
      ['library type', { libType: 'GG20' }],
    ] as const)(
      'withholds changed %s while locked and cannot revive discarded proof',
      async (_name, overrides) => {
        const originalVault = storage.vaults[0]
        const { rerender } = renderTree()
        await resolveRead()
        storage.passcode = null
        rerenderTree(rerender)
        expect(screen.queryByTestId('splash')).toBeNull()

        storage.vaults = [{ ...originalVault, ...overrides } as Vault]
        rerenderTree(rerender)
        await settle()
        expect(screen.getByTestId('splash')).toBeDefined()
        expect(readCalls).toHaveLength(1)

        storage.vaults = [originalVault]
        rerenderTree(rerender)
        await settle()
        expect(screen.getByTestId('splash')).toBeDefined()

        storage.passcode = '135790'
        rerenderTree(rerender)
        expect(screen.getByTestId('splash')).toBeDefined()
        await resolveRead()
        expect(mountCount).toBe(2)
      }
    )

    it('withholds another vault selected while locked, including in a setup view', async () => {
      const { rerender } = renderTree()
      await resolveRead()
      storage.passcode = null
      currentViewId = 'setupFastVault'
      storage.vaults.push(
        makeVault({
          publicKeys: { ecdsa: secondVaultId, eddsa: 'second-eddsa' },
        })
      )
      storage.currentVaultId = secondVaultId
      rerenderTree(rerender)
      await settle()
      expect(screen.getByTestId('splash')).toBeDefined()
      expect(readCalls).toHaveLength(1)
    })

    it('withholds changed encryption and validator inputs until re-proven', async () => {
      const { rerender } = renderTree()
      await resolveRead()
      storage.hasPasscodeEncryption = false
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
      await resolveRead()
      expect(mountCount).toBe(2)

      storage.hasPasscodeEncryption = true
      storage.passcode = null
      rerenderTree(rerender)
      await settle()
      expect(screen.getByTestId('splash')).toBeDefined()

      storage.passcode = '135790'
      rerenderTree(rerender)
      await resolveRead()
      storage.passcode = null
      validateLegacyVaultKeyShares = async () => {}
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
    })

    it('withholds a different unlock passcode until its read succeeds', async () => {
      const { rerender } = renderTree()
      await resolveRead()
      storage.passcode = null
      rerenderTree(rerender)
      storage.passcode = '246801'
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
      expect(readCalls).toHaveLength(2)
    })

    it('does not retain unreadable shares under the lock', async () => {
      const { rerender } = renderTree()
      await act(async () => {
        readCalls[0].reject(new UnreadableVaultKeySharesError())
      })
      expect(screen.getByTestId('unreadable-recovery')).toBeDefined()
      storage.passcode = null
      rerenderTree(rerender)
      expect(screen.getByTestId('splash')).toBeDefined()
      expect(mountCount).toBe(0)
    })

    it('surfaces read errors without ever mounting the vault tree', async () => {
      const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        render(
          <ReadErrorBoundary>
            <RootCurrentVaultProvider>
              <SetupFlow />
            </RootCurrentVaultProvider>
          </ReadErrorBoundary>
        )
        await act(async () => {
          readCalls[0].reject(new Error('vault read failed'))
        })
        expect(screen.getByText('vault read failed')).toBeDefined()
        expect(mountCount).toBe(0)
      } finally {
        errorLog.mockRestore()
      }
    })
  })
})
