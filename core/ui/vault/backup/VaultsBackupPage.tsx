import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'

export const VaultsBackupPage = () => {
  const navigate = useCoreNavigate()
  const vaults = useVaults()

  return (
    <VaultBackupFlow
      vaultIds={vaults.map(vault => getVaultId(vault))}
      onFinish={() => {
        navigate({ id: 'vault' })
      }}
      onBack={() => {
        navigate({ id: 'selectVaultsBackup' })
      }}
    />
  )
}
