import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { MigrateVaultKeygenActionProvider } from '../MigrateVaultKeygenActionProvider'

export const FastMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <PasswordProvider initialValue="">
        <EmailProvider initialValue="">
          <KeygenOperationProvider value={{ reshare: 'migrate' }}>
            <MigrateVaultKeygenActionProvider>
              <FastVaultReshareFlow />
            </MigrateVaultKeygenActionProvider>
          </KeygenOperationProvider>
        </EmailProvider>
      </PasswordProvider>
    </ReshareVaultFlowProviders>
  )
}
