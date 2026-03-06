import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { SingleKeygenActionProvider } from '@core/ui/mpc/keygen/singleKeygen/SingleKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'

export const SingleKeygenFastPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <KeygenOperationProvider value={{ singleKeygen: true }}>
            <SingleKeygenActionProvider>
              <MpcMediatorManager />
              <FastVaultReshareFlow />
            </SingleKeygenActionProvider>
          </KeygenOperationProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
