import { storage } from '@core/extension/storage'
import { getVault } from '@core/extension/storage/vaults'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getDerivationKey } from '@core/ui/mpc/keygen/keyimport/utils/getKeyImportDerivationGroups'
import { isKeyImportVault, Vault } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

/**
 * Checks if the current vault has keys for the given chain.
 * Returns true for non-imported vaults (they derive all chains).
 * For key-import vaults, returns true if any imported chain shares the
 * target chain's BIP44 derivation path — the shared keyshare is valid
 * for all chains in a derivation group even when the user only
 * explicitly imported one of them.
 */
export const hasChainInVault: BackgroundResolver<'hasChainInVault'> = async ({
  input: { chain },
}) => {
  const vault = await resolveCurrentVault()
  if (!vault) {
    return false
  }

  if (!isKeyImportVault(vault)) {
    return true
  }

  if (vault.chainPublicKeys?.[chain]) {
    return true
  }

  const importedChains = getRecordKeys(vault.chainPublicKeys ?? {})
  const targetKey = getDerivationKey(chain)
  return importedChains.some(c => getDerivationKey(c) === targetKey)
}

/** Tries getCurrentVaultId first, then falls back to the first vault in storage. */
const resolveCurrentVault = async (): Promise<Vault | undefined> => {
  const vaultId = await storage.getCurrentVaultId()
  if (vaultId) {
    const { data } = await attempt(getVault(vaultId))
    if (data) return data
  }

  const vaults = await storage.getVaults()
  return vaults[0]
}
