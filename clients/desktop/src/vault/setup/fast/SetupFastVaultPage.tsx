import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateFastVaultFlow } from '@core/ui/mpc/keygen/create/fast/CreateFastVaultFlow'
import { PasswordHintProvider } from '@core/ui/mpc/keygen/create/fast/server/password-hint/state/password-hint'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'

export const SetupFastVaultPage = () => {
  return (
    <VaultSecurityTypeProvider value="fast">
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <PasswordHintProvider initialValue="">
            <CreateVaultFlowProviders>
              <CreateVaultKeygenActionProvider>
                <MpcMediatorManager />
                <CreateFastVaultFlow />
              </CreateVaultKeygenActionProvider>
            </CreateVaultFlowProviders>
          </PasswordHintProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultSecurityTypeProvider>
  )
}
