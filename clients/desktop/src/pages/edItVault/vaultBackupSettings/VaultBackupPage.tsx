import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { VaultBackupFlow } from '../../../vault/setup/shared/vaultBackupSettings/VaultBackupFlow'

export const VaultBackupPage = () => {
  const navigate = useAppNavigate()
  return (
    <VaultBackupFlow
      onFinish={() => {
        navigate('vault')
      }}
    />
  )
}
