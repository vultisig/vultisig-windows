import { getVaultExportUid } from '@core/ui/vault/export/core/uid'
import { getVaultId } from '@core/ui/vault/Vault'

import { storage } from '../../../storage'
import { BackgroundApiResolver } from '../resolver'

export const getVault: BackgroundApiResolver<'getVault'> = async () => {
  const vaults = await storage.getVaults()
  const currentVaultId = await storage.getCurrentVaultId()

  if (!currentVaultId) {
    throw new Error('No vault selected')
  }

  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)
  if (!vault) {
    throw new Error(`Selected vault not found`)
  }

  return {
    name: vault.name,
    uid: getVaultExportUid(vault),
    hexChainCode: vault.hexChainCode,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
  }
}
