import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

export const ReshareSecureVault = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenOperationTypeProvider
        value={{ operation: 'reshare', type: 'regular' }}
      >
        <DKLSKeygenActionProvider>
          <ReshareSecureVaultFlow />
        </DKLSKeygenActionProvider>
      </CurrentKeygenOperationTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
