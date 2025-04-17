import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'

export const SetupSecureVaultPage = () => {
  return (
    <VaultSecurityTypeProvider value="secure">
      <CreateVaultFlowProviders>
        <CreateVaultKeygenActionProvider>
          <MpcMediatorManager />
          <CreateSecureVaultFlow />
        </CreateVaultKeygenActionProvider>
      </CreateVaultFlowProviders>
    </VaultSecurityTypeProvider>
  )
}
