import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { SingleKeygenActionProvider } from '@core/ui/mpc/keygen/singleKeygen/SingleKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { SingleKeygenSecureFlow } from './SingleKeygenSecureFlow'

export const SingleKeygenSecurePage = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ singleKeygen: true }}>
        <SingleKeygenActionProvider>
          <MpcMediatorManager />
          <SingleKeygenSecureFlow />
        </SingleKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
