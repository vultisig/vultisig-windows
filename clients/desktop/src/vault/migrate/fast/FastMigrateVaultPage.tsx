import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { MigrateVaultKeygenActionProvider } from '../MigrateVaultKeygenActionProvider'

export const FastMigrateVaultPage = () => {
  return (
    <GeneratedHexEncryptionKeyProvider>
      <GeneratedMpcSessionIdProvider>
        <MpcPeersSelectionProvider>
          <GeneratedMpcServiceNameProvider>
            <PasswordProvider initialValue="">
              <EmailProvider initialValue="">
                <IsInitiatingDeviceProvider value={true}>
                  <CurrentKeygenTypeProvider value={'migrate'}>
                    <MigrateVaultKeygenActionProvider>
                      <FastVaultKeygenFlow />
                    </MigrateVaultKeygenActionProvider>
                  </CurrentKeygenTypeProvider>
                </IsInitiatingDeviceProvider>
              </EmailProvider>
            </PasswordProvider>
          </GeneratedMpcServiceNameProvider>
        </MpcPeersSelectionProvider>
      </GeneratedMpcSessionIdProvider>
    </GeneratedHexEncryptionKeyProvider>
  )
}
