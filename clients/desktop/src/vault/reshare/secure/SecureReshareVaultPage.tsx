import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'

export const SecureReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenTypeProvider value="reshare">
        <ReshareVaultKeygenActionProvider>
          <MpcMediatorManager />
          <ReshareSecureVaultFlow />
        </ReshareVaultKeygenActionProvider>
      </CurrentKeygenTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
