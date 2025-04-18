import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'

export const SecureMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenTypeProvider value={'migrate'}>
        <MigrateVaultKeygenActionProvider>
          <MpcMediatorManager />
          <ReshareSecureVaultFlow />
        </MigrateVaultKeygenActionProvider>
      </CurrentKeygenTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
