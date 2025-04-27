import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

export const ReshareFastVault = () => (
  <ReshareVaultFlowProviders>
    <PasswordProvider initialValue="">
      <EmailProvider initialValue="">
        <CurrentKeygenTypeProvider value="reshare">
          <ReshareVaultKeygenActionProvider>
            <FastVaultReshareFlow />
          </ReshareVaultKeygenActionProvider>
        </CurrentKeygenTypeProvider>
      </EmailProvider>
    </PasswordProvider>
  </ReshareVaultFlowProviders>
)
