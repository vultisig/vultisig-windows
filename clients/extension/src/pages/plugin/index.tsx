import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

export const PluginPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <CurrentKeygenTypeProvider value="plugin">
            <ReshareVaultKeygenActionProvider>
              <FastVaultReshareFlow />
            </ReshareVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
