import { storage } from '@core/extension/storage'
import { isAppSessionAuthorizedForAccounts } from '@core/extension/storage/appSessionChainAuthorization'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { toVaultExport } from '@core/ui/vault/export/core/toVaultExport'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

export const exportVault: BackgroundResolver<'exportVault'> = async ({
  context: { appSession },
}) => {
  if (!isAppSessionAuthorizedForAccounts(appSession)) {
    throw BackgroundError.Unauthorized
  }

  const vaults = await storage.getVaults()

  const vault = shouldBePresent(
    vaults.find(vault => getVaultId(vault) === appSession.vaultId)
  )

  return toVaultExport(vault)
}
