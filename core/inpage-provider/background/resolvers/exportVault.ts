import { storage } from '@core/extension/storage'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { toVaultExport } from '@core/ui/vault/export/core/toVaultExport'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

export const exportVault: BackgroundResolver<'exportVault'> = async ({
  context: { appSession },
}) => {
  const vaults = await storage.getVaults()

  const vault = shouldBePresent(
    vaults.find(vault => getVaultId(vault) === appSession.vaultId)
  )

  return toVaultExport(vault)
}
