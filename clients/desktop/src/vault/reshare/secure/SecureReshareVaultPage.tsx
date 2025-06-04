import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'

export const SecureReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'regular' }}>
        <ReshareVaultKeygenActionProvider>
          <MpcMediatorManager />
          <ReshareSecureVaultFlow />
        </ReshareVaultKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
