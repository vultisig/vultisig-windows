import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <CurrentKeygenTypeProvider value="reshare">
            <ReshareVaultKeygenActionProvider>
              <FastVaultKeygenFlow />
            </ReshareVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
