import { useVaults } from '../../../queries/useVaultsQuery'
import { CurrentVaultProvider } from '../../../state/currentVault'
import { useCurrentVaultId } from '../../../state/currentVaultId'
import { getStorageVaultId } from '../../../utils/storageVault'
import { UploadQrPageWithExistingVault } from './UploadQrPageWithExistingVault'
import { UploadQrPageWithoutVault } from './UploadQrPageWithoutVault'

export const UploadQrPage = () => {
  const [currentVaultId] = useCurrentVaultId()
  const vaults = useVaults()
  const vault = vaults.find(
    vault => getStorageVaultId(vault) === currentVaultId
  )

  if (!vault) {
    return <UploadQrPageWithoutVault />
  }

  return (
    <CurrentVaultProvider value={vault}>
      <UploadQrPageWithExistingVault />
    </CurrentVaultProvider>
  )
}
