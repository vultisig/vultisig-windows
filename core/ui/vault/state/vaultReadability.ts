import { CoreState } from '@core/ui/state/core'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { areEqualRecords } from '@vultisig/lib-utils/record/areEqualRecords'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

/**
 * Every input a vault's key shares are resolved against. The same stored bytes
 * read differently once the passcode, the encryption setting or the legacy
 * validator changes, so all of them belong to the identity of a settled
 * readability result — not just the vault's own fields.
 */
export type VaultReadabilityInputs = Pick<
  Vault,
  | 'chainKeyShares'
  | 'chainPublicKeys'
  | 'keyShareMldsa'
  | 'keyShares'
  | 'libType'
  | 'publicKeyMldsa'
  | 'publicKeys'
> & {
  vaultId: string
  hasPasscodeEncryption: boolean
  passcode: string | null
  validateLegacyVaultKeyShares: CoreState['validateLegacyVaultKeyShares']
}

type GetVaultReadabilityInputsInput = {
  vault: Vault
  hasPasscodeEncryption: boolean
  passcode: string | null
  validateLegacyVaultKeyShares: CoreState['validateLegacyVaultKeyShares']
}

/**
 * Snapshots the inputs a key-share read is about to be requested with. Taken
 * before the read starts, so a result can never be attributed to inputs it was
 * not read under. Copy key records so in-place storage updates cannot mutate
 * the inputs a settled result was validated against.
 */
export const getVaultReadabilityInputs = ({
  vault,
  hasPasscodeEncryption,
  passcode,
  validateLegacyVaultKeyShares,
}: GetVaultReadabilityInputsInput): VaultReadabilityInputs => ({
  vaultId: getVaultId(vault),
  libType: vault.libType,
  keyShares: { ...vault.keyShares },
  chainKeyShares: vault.chainKeyShares
    ? { ...vault.chainKeyShares }
    : undefined,
  keyShareMldsa: vault.keyShareMldsa,
  publicKeys: { ...vault.publicKeys },
  chainPublicKeys: vault.chainPublicKeys
    ? { ...vault.chainPublicKeys }
    : undefined,
  publicKeyMldsa: vault.publicKeyMldsa,
  hasPasscodeEncryption,
  passcode,
  validateLegacyVaultKeyShares,
})

type HasSameReadabilityInputsInput = {
  /** The inputs the settled result was read under. */
  resolved: VaultReadabilityInputs
  /** The inputs a read requested right now would use. */
  current: VaultReadabilityInputs
}

type AreEqualReadabilityValuesInput = {
  previous: VaultReadabilityInputs[keyof VaultReadabilityInputs]
  next: VaultReadabilityInputs[keyof VaultReadabilityInputs]
}

// Storage reloads can reconstruct identical key maps. Compare both their own
// field names and values, including optional fields whose value is undefined.
const areEqualReadabilityValues = ({
  previous,
  next,
}: AreEqualReadabilityValuesInput) => {
  if (previous === next) return true
  if (
    typeof previous !== 'object' ||
    previous === null ||
    typeof next !== 'object' ||
    next === null
  )
    return false
  return (
    Object.keys(previous).every(field =>
      Object.prototype.hasOwnProperty.call(next, field)
    ) && areEqualRecords(previous, next)
  )
}

/**
 * Whether a settled readability result still describes the inputs on screen.
 * Storage merges coins into a fresh vault object on every coin write, so
 * comparing the vault objects themselves would discard a result on a change
 * that cannot affect readability. Walking the snapshot's own keys keeps the
 * check exhaustive: an input added to {@link VaultReadabilityInputs} is
 * compared without also having to be listed here.
 */
export const hasSameReadabilityInputs = ({
  resolved,
  current,
}: HasSameReadabilityInputsInput) =>
  getRecordKeys(resolved).every(key =>
    areEqualReadabilityValues({ previous: resolved[key], next: current[key] })
  )

/**
 * Whether a read proven under `resolved` still vouches for the stored shares
 * while the lock has taken the passcode away, or while they are read again
 * once it is back. Locking changes nothing the stored shares decrypt to, so a
 * withdrawn passcode is not a difference — but any other input is, and so is a
 * different passcode after unlocking.
 */
export const canHoldProvenSharesAcrossLock = ({
  resolved,
  current,
}: HasSameReadabilityInputsInput) =>
  getRecordKeys(resolved).every(
    key =>
      areEqualReadabilityValues({
        previous: resolved[key],
        next: current[key],
      }) ||
      (key === 'passcode' && current.passcode === null)
  )
