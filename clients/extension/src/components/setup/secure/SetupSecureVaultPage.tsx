import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'

export const SetupSecureVaultPage = () => {
  return (
    <VaultSecurityTypeProvider value="secure">
      <CreateVaultFlowProviders>
        <CreateVaultKeygenActionProvider>
          <CreateSecureVaultFlow />
        </CreateVaultKeygenActionProvider>
      </CreateVaultFlowProviders>
    </VaultSecurityTypeProvider>
  )
}
