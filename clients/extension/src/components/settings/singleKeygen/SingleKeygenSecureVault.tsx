import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { SingleKeygenActionProvider } from '@core/ui/mpc/keygen/singleKeygen/SingleKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

export const SingleKeygenSecureVault = () => (
  <ReshareVaultFlowProviders>
    <KeygenOperationProvider value={{ singleKeygen: true }}>
      <SingleKeygenActionProvider>
        <ReshareSecureVaultFlow />
      </SingleKeygenActionProvider>
    </KeygenOperationProvider>
  </ReshareVaultFlowProviders>
)
