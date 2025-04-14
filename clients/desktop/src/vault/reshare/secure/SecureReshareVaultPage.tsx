import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { SecureVaultKeygenFlow } from '../../keygen/shared/SecureVaultKeygenFlow'

export const SecureReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenTypeProvider value="reshare">
        <ReshareVaultKeygenActionProvider>
          <SecureVaultKeygenFlow />
        </ReshareVaultKeygenActionProvider>
      </CurrentKeygenTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
