import { storage } from '@core/extension/storage'
import { getVault } from '@core/extension/storage/vaults'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { isKeyImportVault, Vault } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'

/**
 * Checks if the current vault has keys for the given chain.
 * Returns true for non-imported vaults (they derive all chains).
 * For key-import vaults, returns true only if the chain exists in chainPublicKeys.
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

  return !!vault.chainPublicKeys?.[chain]
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
