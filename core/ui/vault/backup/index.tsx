import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'

export const VaultBackupPage = () => {
  const navigate = useCoreNavigate()
  const currentVault = useCurrentVault()

  return (
    <VaultBackupFlow
      vaultIds={[getVaultId(currentVault)]}
      onFinish={() => {
        navigate({ id: 'vault' })
      }}
    />
  )
}
