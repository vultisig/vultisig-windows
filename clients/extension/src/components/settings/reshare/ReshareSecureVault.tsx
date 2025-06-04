import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

export const ReshareSecureVault = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'regular' }}>
        <DKLSKeygenActionProvider>
          <ReshareSecureVaultFlow />
        </DKLSKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
