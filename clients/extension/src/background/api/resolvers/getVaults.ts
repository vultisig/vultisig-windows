import { storage } from '@core/extension/storage'
import { getVaultExportUid } from '@core/ui/vault/export/core/uid'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { callPopupApi } from '../../../popup/api/call'
import { BackgroundApiResolver } from '../resolver'

export const getVaults: BackgroundApiResolver<'getVaults'> = async () => {
  const { vaultIds } = await callPopupApi({
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
