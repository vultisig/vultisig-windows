import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'

export const SecureReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenOperationTypeProvider
        value={{ operation: 'reshare', type: 'regular' }}
      >
        <ReshareVaultKeygenActionProvider>
          <MpcMediatorManager />
          <ReshareSecureVaultFlow />
        </ReshareVaultKeygenActionProvider>
      </CurrentKeygenOperationTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
