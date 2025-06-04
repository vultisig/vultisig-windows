import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

export const ReshareFastVault = () => (
  <ReshareVaultFlowProviders>
    <PasswordProvider initialValue="">
      <EmailProvider initialValue="">
        <KeygenOperationProvider value={{ reshare: 'regular' }}>
          <ReshareVaultKeygenActionProvider>
            <FastVaultReshareFlow />
          </ReshareVaultKeygenActionProvider>
        </KeygenOperationProvider>
      </EmailProvider>
    </PasswordProvider>
  </ReshareVaultFlowProviders>
)
