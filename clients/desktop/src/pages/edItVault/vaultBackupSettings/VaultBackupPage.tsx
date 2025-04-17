import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { VaultBackupFlow } from '../../../vault/setup/shared/vaultBackupSettings/VaultBackupFlow'

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
