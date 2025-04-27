import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
export const FastReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <CurrentKeygenTypeProvider value="reshare">
            <ReshareVaultKeygenActionProvider>
              <MpcMediatorManager />
              <FastVaultReshareFlow />
            </ReshareVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
