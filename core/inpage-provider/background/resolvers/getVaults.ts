import { storage } from '@core/extension/storage'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { callPopup } from '@core/inpage-provider/popup'
import { getVaultExportUid } from '@core/ui/vault/export/core/uid'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getVaults: BackgroundResolver<'getVaults'> = async () => {
  const { vaultIds } = await callPopup({
    grantVaultsAccess: {},
  })

  const vaults = await storage.getVaults()

  return vaultIds.map(vaultId => {
    const vault = shouldBePresent(
      vaults.find(vault => getVaultId(vault) === vaultId)
    )

    return {
      name: vault.name,
      uid: getVaultExportUid(vault),
      hexChainCode: vault.hexChainCode,
      publicKeyEcdsa: vault.publicKeys.ecdsa,
      publicKeyEddsa: vault.publicKeys.eddsa,
    }
  })
}
