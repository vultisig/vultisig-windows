import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'
import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'

export const SecureMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenTypeProvider value={'migrate'}>
        <MigrateVaultKeygenActionProvider>
          <SecureVaultKeygenFlow />
        </MigrateVaultKeygenActionProvider>
      </CurrentKeygenTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
