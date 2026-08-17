// @vitest-environment happy-dom
/**
 * Crash-injection tests for the passcode set / change / disable flows.
 *
 * Reproduces https://github.com/vultisig/vultisig-windows/issues/4599: the key
 * shares and the `encryptedSample` that proves a passcode are two independent
 * durable writes with no transaction spanning them, so a teardown between them
 * (closing the extension popup is enough) leaves storage in a state where no
 * passcode can open the vault again.
 *
 * Everything below the injection point is production code: the real mutation
 * hooks, the real PBKDF2 cipher, and the real extension storage adapters
 * writing through `chrome.storage.local`. The only thing the test controls is
 * *when* the popup dies — expressed as "die right after the Nth storage write
 * lands", which is deterministic instead of racing a ~1s mutation.
 */
import { passcodeEncryptionStorage } from '@core/extension/storage/passcodeEncryption'
import { vaultsStorage } from '@core/extension/storage/vaults'
import {
  isPasscodeRequired,
  verifyPasscode,
} from '@core/ui/passcodeEncryption/core/passcodeLock'
import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import { decryptVaultAllKeyShares } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { useChangePasscodeMutation } from '@core/ui/passcodeEncryption/manage/change/mutations/changePasscode'
import { useDisablePasscodeMutation } from '@core/ui/passcodeEncryption/mutations/useDisablePasscodeMutation'
import { useSetPasscodeMutation } from '@core/ui/passcodeEncryption/mutations/useSetPasscodeMutation'
import { useUpgradePasscodeEncryptionMutation } from '@core/ui/passcodeEncryption/mutations/useUpgradePasscodeEncryptionMutation'
import { PasscodeProvider } from '@core/ui/passcodeEncryption/state/passcode'
import { PasscodeEncryptionStorage } from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultsProvider, VaultsStorage } from '@core/ui/storage/vaults'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@vultisig/lib-utils/encryption/config'
import {
  VAULT_BACKUP_BLOB_MAGIC,
  VAULT_BACKUP_MAGIC_LEN,
} from '@vultisig/lib-utils/encryption/vaultBackup/vaultBackupConstants'
import { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The storage barrel reaches a UI module that pulls in the Lottie player, which
// needs a real canvas. Nothing under test animates.
vi.mock('lottie-react', () => ({ default: () => null }))

// The extension builds its CoreState by spreading these same two adapters
// (core/extension/storage/index.tsx:36,45), so the mutations under test talk to
// exactly the storage they talk to in production. The adapters are imported
// normally and handed over through this holder — importing them inside the
// factory would deadlock, since their own module graph reaches this mock.
type CoreStub = PasscodeEncryptionStorage &
  Pick<VaultsStorage, 'getVaults' | 'updateVaultsKeyShares'>

const coreHolder: { value: CoreStub | undefined } = vi.hoisted(() => ({
  value: undefined,
}))

vi.mock('@core/ui/state/core', () => ({
  useCore: () => shouldBePresent(coreHolder.value),
}))

coreHolder.value = { ...vaultsStorage, ...passcodeEncryptionStorage }

const passcode = '123456'
const newPasscode = '654321'

const ecdsaShare = 'ecdsa-key-share-plaintext'
const eddsaShare = 'eddsa-key-share-plaintext'

const vault: Vault = {
  name: 'Test Vault',
  publicKeys: { ecdsa: 'ecdsa-public-key', eddsa: 'eddsa-public-key' },
  signers: ['device-1'],
  hexChainCode: 'chain-code',
  keyShares: { ecdsa: ecdsaShare, eddsa: eddsaShare },
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const isEncryptedBlob = (value: string) =>
  Buffer.from(value, encryptedEncoding)
    .subarray(0, VAULT_BACKUP_MAGIC_LEN)
    .equals(VAULT_BACKUP_BLOB_MAGIC)

/**
 * Runs `action` the moment the `writeIndex`-th `chrome.storage.local.set`
 * lands, before the caller reaches its next statement. Throwing from `action`
 * models the popup being torn down right there; awaiting other work models a
 * second flow interleaving at that exact point. Returns the restore function.
 */
const afterStorageWrite = (writeIndex: number, action: () => Promise<void>) => {
  const original = chrome.storage.local.set
  let writes = 0

  chrome.storage.local.set = async (items: Record<string, unknown>) => {
    await original(items)
    writes += 1
    if (writes === writeIndex) {
      await action()
    }
  }

  return () => {
    chrome.storage.local.set = original
  }
}

const killPopupAfterWrite = (writeIndex: number) =>
  afterStorageWrite(writeIndex, async () => {
    throw new Error('popup destroyed')
  })

/**
 * Mounts hooks with the providers the popup gives them: the passcode held in
 * memory, the vault snapshot read at render time, and the passcode proof
 * already in the query cache, the way it is once the app has unlocked.
 */
const renderInPopup = async <T,>(
  useHooks: () => T,
  passcodeInMemory: string | null
) => {
  const vaults = (await vaultsStorage.getVaults()).map(v => ({
    ...v,
    coins: [],
  }))

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  queryClient.setQueryData(
    [StorageKey.passcodeEncryption],
    await passcodeEncryptionStorage.getPasscodeEncryption()
  )

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <PasscodeProvider initialValue={passcodeInMemory}>
        <VaultsProvider value={vaults}>{children}</VaultsProvider>
      </PasscodeProvider>
    </QueryClientProvider>
  )

  return renderHook(useHooks, { wrapper })
}

// The popup is gone once a mutation settles; leaving it mounted lets React
// Query settle state after the act block and warns about it.
const closePopup = async (unmount: () => void) => {
  await act(async () => {
    unmount()
  })
}

type RunMutationInput<T> = {
  useMutationHook: () => { mutateAsync: (input: T) => Promise<unknown> }
  input: T
  passcodeInMemory: string | null
}

/**
 * Renders one passcode mutation and runs it to completion. Rejections are the
 * point of these tests, so they are swallowed here and asserted on storage
 * afterwards.
 */
const runMutation = async <T,>({
  useMutationHook,
  input,
  passcodeInMemory,
}: RunMutationInput<T>) => {
  const { result, unmount } = await renderInPopup(
    useMutationHook,
    passcodeInMemory
  )

  await act(async () => {
    await result.current.mutateAsync(input).catch(() => {})
  })

  await closePopup(unmount)
}

/**
 * What the app serves for the vault's ECDSA key share on the next launch. Both
 * decisions come from the production entry points rather than being restated
 * here, so this cannot drift from what the app does:
 *
 * - whether a lock screen appears at all (`useIsPasscodeRequired`)
 * - which passcode that lock screen accepts (`verifyPasscode`)
 *
 * The last step is the app's own leniency: `currentVault` swallows a failed
 * share decryption and serves the stored record untouched
 * (currentVault.tsx:82-88), which is how ciphertext reaches signing.
 */
const openVaultOnNextLaunch = async (knownPasscodes: string[]) => {
  const [storedVault] = await vaultsStorage.getVaults()
  const proof = await passcodeEncryptionStorage.getPasscodeEncryption()
  const encryptedSample = proof?.encryptedSample ?? null

  const served = async (share: string) => ({
    ecdsaShare: share,
    servedCiphertext: isEncryptedBlob(share),
  })

  const lockState = { vaults: [storedVault], encryptedSample }

  if (!isPasscodeRequired(lockState)) {
    return served(storedVault.keyShares.ecdsa)
  }

  for (const candidate of knownPasscodes) {
    const opensLockScreen = await verifyPasscode({
      ...lockState,
      passcode: candidate,
    })

    if (!opensLockScreen) continue

    const shares = await decryptVaultAllKeyShares({
      key: candidate,
      keyShares: storedVault.keyShares,
      chainKeyShares: storedVault.chainKeyShares,
      keyShareMldsa: storedVault.keyShareMldsa,
    }).catch(() => null)

    return served(shares?.keyShares.ecdsa ?? storedVault.keyShares.ecdsa)
  }

  return { ecdsaShare: null, servedCiphertext: false }
}

/**
 * Puts the vault in the state the legacy re-wrap exists for: shares sealed with
 * the old `SHA-256(passcode)` KDF, alongside a proof already on the current
 * PBKDF2 format so only the share branch of the upgrade has work to do.
 */
const seedLegacyEncryptedVault = async () => {
  const seal = (value: string) =>
    encryptWithAesGcm({
      key: passcode,
      value: Buffer.from(value, plainTextEncoding),
    }).toString(encryptedEncoding)

  await chrome.storage.local.set({
    [StorageKey.vaults]: [
      {
        ...vault,
        keyShares: { ecdsa: seal(ecdsaShare), eddsa: seal(eddsaShare) },
      },
    ],
  })

  await passcodeEncryptionStorage.setPasscodeEncryption({
    encryptedSample: await encryptSample({ key: passcode, value: 'sample' }),
  })
}

const healthyVault = { ecdsaShare, servedCiphertext: false }

let restorePopup = () => {}

/**
 * Changes the passcode on a legacy-encrypted vault, optionally letting the
 * legacy re-wrap run in change-passcode's window between the vault write
 * (changePasscode.ts:48) and `setPasscode` (changePasscode.ts:51). The re-wrap
 * auto-fires on unlock (PasscodeGuard.tsx:42), and its staleness guard reads a
 * ref that only moves at :51 — so inside that window it still sees the old
 * passcode as live and re-writes old-key blobs over the new-key ones.
 */
const changePasscodeOverLegacyVault = async ({
  interleaveUpgrade,
}: {
  interleaveUpgrade: boolean
}) => {
  await seedLegacyEncryptedVault()

  const { result, unmount } = await renderInPopup(
    () => ({
      change: useChangePasscodeMutation(),
      upgrade: useUpgradePasscodeEncryptionMutation(),
    }),
    passcode
  )

  if (interleaveUpgrade) {
    restorePopup = afterStorageWrite(1, async () => {
      await result.current.upgrade.mutateAsync().catch(() => {})
    })
  }

  await act(async () => {
    await result.current.change.mutateAsync(newPasscode).catch(() => {})
  })

  await closePopup(unmount)
}

describe('passcode set/change survives a popup teardown', () => {
  beforeEach(async () => {
    await chrome.storage.local.set({ [StorageKey.vaults]: [vault] })
  })

  afterEach(() => {
    restorePopup()
    restorePopup = () => {}
  })

  it('opens with the passcode when nothing interrupts set-passcode', async () => {
    await runMutation({
      useMutationHook: useSetPasscodeMutation,
      input: passcode,
      passcodeInMemory: null,
    })

    expect(await openVaultOnNextLaunch([passcode])).toEqual(healthyVault)
  })

  it('survives the popup dying between the two set-passcode writes', async () => {
    restorePopup = killPopupAfterWrite(1)

    await runMutation({
      useMutationHook: useSetPasscodeMutation,
      input: passcode,
      passcodeInMemory: null,
    })

    expect(await openVaultOnNextLaunch([passcode])).toEqual(healthyVault)
  })

  it('survives the popup dying between the two change-passcode writes', async () => {
    await runMutation({
      useMutationHook: useSetPasscodeMutation,
      input: passcode,
      passcodeInMemory: null,
    })

    restorePopup = killPopupAfterWrite(1)

    await runMutation({
      useMutationHook: useChangePasscodeMutation,
      input: newPasscode,
      passcodeInMemory: passcode,
    })

    expect(await openVaultOnNextLaunch([passcode, newPasscode])).toEqual(
      healthyVault
    )
  })

  it('survives the popup dying midway through disable-passcode', async () => {
    await runMutation({
      useMutationHook: useSetPasscodeMutation,
      input: passcode,
      passcodeInMemory: null,
    })

    restorePopup = killPopupAfterWrite(1)

    await runMutation({
      useMutationHook: useDisablePasscodeMutation,
      input: undefined,
      passcodeInMemory: passcode,
    })

    expect(await openVaultOnNextLaunch([passcode])).toEqual(healthyVault)
  })

  it('opens after the desktop WebView profile drops the proof but keeps the shares', async () => {
    await runMutation({
      useMutationHook: useSetPasscodeMutation,
      input: passcode,
      passcodeInMemory: null,
    })

    // Desktop keeps the shares in SQLite and the proof in the WebView's
    // localStorage (clients/desktop/src/storage/passcodeEncryption.ts:22-24), so
    // a WebView2 profile reset wipes one and leaves the other.
    await chrome.storage.local.remove(StorageKey.passcodeEncryption)

    expect(await openVaultOnNextLaunch([passcode])).toEqual(healthyVault)
  })

  // Change-passcode runs to completion in both of these, so the new passcode is
  // the only one the user is left holding — offering the old one as a candidate
  // would hide a re-wrap that put the shares back under it.
  it('opens with the new passcode when the legacy re-wrap stays out of the way', async () => {
    await changePasscodeOverLegacyVault({ interleaveUpgrade: false })

    expect(await openVaultOnNextLaunch([newPasscode])).toEqual(healthyVault)
  })

  it('survives the legacy re-wrap landing in the middle of change-passcode', async () => {
    await changePasscodeOverLegacyVault({ interleaveUpgrade: true })

    expect(await openVaultOnNextLaunch([newPasscode])).toEqual(healthyVault)
  })
})
