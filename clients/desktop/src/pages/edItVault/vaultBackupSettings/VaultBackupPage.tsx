import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'

export const VaultBackupPage = () => {
  const navigate = useCoreNavigate()

  return (
    <VaultBackupFlow
      onFinish={() => {
        navigate('vault')
      }}
    />
  )
}
