import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastReshareVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <GeneratedHexEncryptionKeyProvider>
        <GeneratedMpcSessionIdProvider>
          <PasswordProvider initialValue="">
            <EmailProvider initialValue="">
              <CurrentKeygenTypeProvider value="reshare">
                <ReshareVaultKeygenActionProvider>
                  <FastVaultKeygenFlow />
                </ReshareVaultKeygenActionProvider>
              </CurrentKeygenTypeProvider>
            </EmailProvider>
          </PasswordProvider>
        </GeneratedMpcSessionIdProvider>
      </GeneratedHexEncryptionKeyProvider>
    </ReshareVaultFlowProviders>
  )
}
