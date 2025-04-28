import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { CurrentVaultCoinsProvider } from '@core/ui/vault/state/currentVaultCoins'
import { useCurrentVaultId } from '@core/ui/vault/state/currentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'

import { UploadQrPageWithExistingVault } from './UploadQrPageWithExistingVault'
import { UploadQrPageWithoutVault } from './UploadQrPageWithoutVault'

export const UploadQrPage = () => {
  const currentVaultId = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  if (!vault) {
    return <UploadQrPageWithoutVault />
  }

  return (
    <CurrentVaultProvider value={vault}>
      <CurrentVaultCoinsProvider value={vault.coins}>
        <UploadQrPageWithExistingVault />
      </CurrentVaultCoinsProvider>
    </CurrentVaultProvider>
  )
}
