import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'

export const VaultsBackupPage = () => {
  const navigate = useCoreNavigate()
  const vaults = useVaults()

  return (
    <VaultBackupFlow
      vaults={vaults}
      onFinish={() => {
        navigate({ id: 'vault' })
      }}
    />
  )
}
