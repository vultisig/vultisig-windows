import { CoreState } from '@core/ui/state/core'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
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
 * not read under.
 */
export const getVaultReadabilityInputs = ({
  vault,
  hasPasscodeEncryption,
  passcode,
  validateLegacyVaultKeyShares,
}: GetVaultReadabilityInputsInput): VaultReadabilityInputs => ({
  vaultId: getVaultId(vault),
  libType: vault.libType,
  keyShares: vault.keyShares,
  chainKeyShares: vault.chainKeyShares,
  keyShareMldsa: vault.keyShareMldsa,
  publicKeys: vault.publicKeys,
  chainPublicKeys: vault.chainPublicKeys,
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
  getRecordKeys(resolved).every(key => resolved[key] === current[key])
