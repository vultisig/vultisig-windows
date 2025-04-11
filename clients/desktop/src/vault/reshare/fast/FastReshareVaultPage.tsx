import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { CurrentVaultHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { CurrentVaultLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { ReshareVaultKeygenActionProvider } from '../../keygen/reshare/ReshareVaultKeygenActionProvider'
import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'

export const FastReshareVaultPage = () => {
  return (
    <CurrentVaultLocalPartyIdProvider>
      <ServerUrlDerivedFromServerTypeProvider>
        <MpcServerTypeProvider initialValue="relay">
          <CurrentVaultHexChainCodeProvider>
            <GeneratedHexEncryptionKeyProvider>
              <GeneratedMpcSessionIdProvider>
                <MpcPeersSelectionProvider>
                  <GeneratedMpcServiceNameProvider>
                    <PasswordProvider initialValue="">
                      <EmailProvider initialValue="">
                        <IsInitiatingDeviceProvider value={true}>
                          <CurrentKeygenTypeProvider value="reshare">
                            <ReshareVaultKeygenActionProvider>
                              <FastVaultKeygenFlow />
                            </ReshareVaultKeygenActionProvider>
                          </CurrentKeygenTypeProvider>
                        </IsInitiatingDeviceProvider>
                      </EmailProvider>
                    </PasswordProvider>
                  </GeneratedMpcServiceNameProvider>
                </MpcPeersSelectionProvider>
              </GeneratedMpcSessionIdProvider>
            </GeneratedHexEncryptionKeyProvider>
          </CurrentVaultHexChainCodeProvider>
        </MpcServerTypeProvider>
      </ServerUrlDerivedFromServerTypeProvider>
    </CurrentVaultLocalPartyIdProvider>
  )
}
