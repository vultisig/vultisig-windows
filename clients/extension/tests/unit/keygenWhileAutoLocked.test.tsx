// @vitest-environment happy-dom
/**
 * Regression tests for
 * https://github.com/vultisig/vultisig-windows/issues/4598: a keygen/reshare
 * ceremony completing while the passcode auto-lock has fired used to throw
 * away the new key share — the save mutation read the live (nulled) passcode
 * and threw before persisting anything, while the peers had already committed
 * the reshared share set.
 *
 * Two guarantees are pinned down, for the reshare operation specifically (the
 * longest unattended window):
 *
 * - the auto-lock defers while a keygen flow is mounted, so the passcode is
 *   still in hand when the ceremony completes
 * - even with the passcode gone, `SaveVaultStep` defers the save until unlock
 *   instead of firing a mutation that discards the share's only copy
 *
 * The save path below `SaveVaultStep` is production code: the real vault
 * mutations, the real PBKDF2 passcode cipher, and the real extension storage
 * adapters writing through `chrome.storage.local`. Only WalletCore address
 * derivation and presentational chrome are stubbed.
 */
import { passcodeEncryptionStorage } from '@core/extension/storage/passcodeEncryption'
import { vaultsStorage } from '@core/extension/storage/vaults'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { PasscodeAutoLock } from '@core/ui/passcodeEncryption/autoLock/PasscodeAutoLock'
import { PasscodeAutoLockHoldsProvider } from '@core/ui/passcodeEncryption/autoLock/passcodeAutoLockHolds'
import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import {
  decryptVaultAllKeyShares,
  encryptVaultAllKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import {
  PasscodeProvider,
  usePasscode,
} from '@core/ui/passcodeEncryption/state/passcode'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultsProvider } from '@core/ui/storage/vaults'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The Spinner in the pending state reaches the Lottie player (needs a real
// canvas) and the Rive runtime (fetches WASM from a CDN at import time).
// Nothing under test animates.
vi.mock('lottie-react', () => ({ default: () => null }))
vi.mock('@lib/ui/animations/Animation', () => ({ Animation: () => null }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children?: ReactNode }) => children ?? null,
}))

// The header pulls in navigation; the save behavior under test does not.
vi.mock('@core/ui/flow/FlowPageHeader', () => ({
  FlowPageHeader: () => null,
}))

// Address derivation needs the WalletCore WASM; the save path only threads the
// result into coin records.
vi.mock('@core/ui/chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))

vi.mock('@vultisig/core-chain/publicKey/address/getChainAddress', () => ({
  getChainAddress: ({ chain }: { chain: string }) => `address-${chain}`,
}))

type CoreStub = Record<string, unknown>

const coreHolder: { value: CoreStub | undefined } = vi.hoisted(() => ({
  value: undefined,
}))

vi.mock('@core/ui/state/core', () => ({
  useCore: () => shouldBePresent(coreHolder.value),
}))

const currentVaultIdHolder: { value: string | null } = { value: null }

coreHolder.value = {
  ...vaultsStorage,
  ...passcodeEncryptionStorage,
  createCoins: async () => {},
  setCurrentVaultId: async (value: string | null) => {
    currentVaultIdHolder.value = value
  },
  setFriendReferral: async () => {},
  getPasscodeAutoLock: async () => 1,
  setPasscodeUnlockSession: async () => {},
}

const passcode = '135790'

const oldEcdsaShare = 'old-ecdsa-key-share'
const oldEddsaShare = 'old-eddsa-key-share'
const newEcdsaShare = 'reshared-ecdsa-key-share'
const newEddsaShare = 'reshared-eddsa-key-share'

const baseVault: Omit<Vault, 'keyShares'> = {
  name: 'Test Vault',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['device-1', 'device-2'],
  hexChainCode: 'chain-code',
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

/** The ceremony's in-memory result: same vault id, brand-new plaintext shares. */
const resharedVault: Vault = {
  ...baseVault,
  keyShares: { ecdsa: newEcdsaShare, eddsa: newEddsaShare },
}

const autoLockMs = 60_000

const makeQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  queryClient.setQueryData([StorageKey.passcodeAutoLock], 1)

  return queryClient
}

/**
 * Seeds storage the way it looks mid-reshare: the pre-reshare vault sealed
 * under the passcode, with the passcode proof beside it.
 */
const seedSealedVault = async () => {
  const sealed = await encryptVaultAllKeyShares({
    keyShares: { ecdsa: oldEcdsaShare, eddsa: oldEddsaShare },
    chainKeyShares: undefined,
    keyShareMldsa: undefined,
    key: passcode,
  })

  const storedVault: Vault = {
    ...baseVault,
    keyShares: {
      ecdsa: shouldBePresent(sealed.keyShares.ecdsa),
      eddsa: shouldBePresent(sealed.keyShares.eddsa),
    },
  }

  await chrome.storage.local.set({ [StorageKey.vaults]: [storedVault] })

  const encryptedSample = await encryptSample({
    key: passcode,
    value: 'sample',
  })
  await passcodeEncryptionStorage.setPasscodeEncryption({ encryptedSample })

  return { storedVault, encryptedSample }
}

/**
 * Renders the in-memory passcode for assertions and unlocks on click, the way
 * `EnterPasscode` would.
 */
const PasscodeProbe = () => {
  const [value, setValue] = usePasscode()

  return (
    <button data-testid="unlock" onClick={() => setValue(passcode)}>
      <span data-testid="passcode-probe">{String(value)}</span>
    </button>
  )
}

const observedPasscode = () => screen.getByTestId('passcode-probe').textContent

afterEach(() => {
  vi.useRealTimers()
  currentVaultIdHolder.value = null
})

describe('auto-lock holds while a reshare flow is mounted', () => {
  const renderAutoLock = (withReshareFlow: boolean) => (
    <QueryClientProvider client={makeQueryClient()}>
      <PasscodeProvider initialValue={passcode}>
        <PasscodeAutoLockHoldsProvider>
          <PasscodeAutoLock />
          <PasscodeProbe />
          {withReshareFlow && (
            <KeygenOperationProvider value={{ reshare: 'regular' }}>
              <div />
            </KeygenOperationProvider>
          )}
        </PasscodeAutoLockHoldsProvider>
      </PasscodeProvider>
    </QueryClientProvider>
  )

  it('locks after the interval when no keygen flow is mounted', () => {
    vi.useFakeTimers()

    render(renderAutoLock(false))
    expect(observedPasscode()).toBe(passcode)

    act(() => {
      vi.advanceTimersByTime(autoLockMs + 1)
    })

    expect(observedPasscode()).toBe('null')
  })

  it('keeps the passcode through many idle intervals, then locks one interval after the flow unmounts', () => {
    vi.useFakeTimers()

    const { rerender } = render(renderAutoLock(true))

    // A reshare can sit unattended far past the lock interval waiting on the
    // peer device; the hold must survive every deferred firing.
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

describe('a reshare completing while locked never discards the new share', () => {
  const renderSaveVaultStep = async (passcodeInMemory: string | null) => {
    const { storedVault } = await seedSealedVault()

    const queryClient = makeQueryClient()
    queryClient.setQueryData(
      [StorageKey.passcodeEncryption],
      await passcodeEncryptionStorage.getPasscodeEncryption()
    )

    const onFinish = vi.fn()

    const view = render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <PasscodeProvider initialValue={passcodeInMemory}>
            <VaultsProvider value={[{ ...storedVault, coins: [] }]}>
              <PasscodeProbe />
              <SaveVaultStep
                value={resharedVault}
                title="reshare"
                onBack={() => {}}
                onFinish={onFinish}
              />
            </VaultsProvider>
          </PasscodeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )

    return { view, onFinish, storedVault }
  }

  const expectStoredShares = async (expected: {
    ecdsa: string
    eddsa: string
  }) => {
    const [stored] = await vaultsStorage.getVaults()

    // Sealed at rest: the plaintext must not be what storage holds…
    expect(stored.keyShares.ecdsa).not.toBe(expected.ecdsa)
    expect(stored.keyShares.eddsa).not.toBe(expected.eddsa)

    // …but the passcode must open it to exactly the expected shares.
    const opened = await decryptVaultAllKeyShares({
      keyShares: stored.keyShares,
      chainKeyShares: stored.chainKeyShares,
      keyShareMldsa: stored.keyShareMldsa,
      key: passcode,
    })

    expect(opened.keyShares).toEqual(expected)
  }

  it('defers the save while locked and persists the sealed share on unlock', async () => {
    const { view, onFinish } = await renderSaveVaultStep(null)

    // Let any wrongly-fired mutation settle before asserting nothing moved.
    await act(async () => {})

    expect(onFinish).not.toHaveBeenCalled()
    expect(view.container.textContent).toContain('saving_vault')
    expect(view.container.textContent).not.toContain('failed_to_save_vault')
    await expectStoredShares({ ecdsa: oldEcdsaShare, eddsa: oldEddsaShare })

    fireEvent.click(view.getByTestId('unlock'))

    await waitFor(() => expect(onFinish).toHaveBeenCalledOnce())

    const vaults = await vaultsStorage.getVaults()
    expect(vaults).toHaveLength(1)
    await expectStoredShares({ ecdsa: newEcdsaShare, eddsa: newEddsaShare })
    expect(currentVaultIdHolder.value).toBe(baseVault.publicKeys.ecdsa)
  })

  it('saves immediately when the app is unlocked', async () => {
    const { onFinish } = await renderSaveVaultStep(passcode)

    await waitFor(() => expect(onFinish).toHaveBeenCalledOnce())

    await expectStoredShares({ ecdsa: newEcdsaShare, eddsa: newEddsaShare })
  })
})
