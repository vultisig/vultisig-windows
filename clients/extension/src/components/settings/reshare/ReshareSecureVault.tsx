import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'

export const ReshareSecureVault = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenTypeProvider value="reshare">
        <DKLSKeygenActionProvider>
          <ReshareSecureVaultFlow />
        </DKLSKeygenActionProvider>
      </CurrentKeygenTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
