import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { MigrateVaultKeygenActionProvider } from '../MigrateVaultKeygenActionProvider'

export const FastMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <CurrentKeygenTypeProvider value={'migrate'}>
            <MigrateVaultKeygenActionProvider>
              <FastVaultReshareFlow />
            </MigrateVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
