import { storage } from '@core/extension/storage'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getVaultExportUid } from '@core/ui/vault/export/core/uid'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getVault: BackgroundResolver<'getVault'> = async () => {
  const vaults = await storage.getVaults()
  const currentVaultId = shouldBePresent(await storage.getCurrentVaultId())

  const vault = shouldBePresent(
    vaults.find(vault => getVaultId(vault) === currentVaultId)
  )

  return {
    name: vault.name,
    uid: getVaultExportUid(vault),
    hexChainCode: vault.hexChainCode,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
  }
}
