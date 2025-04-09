import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { GeneratedMpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'

import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType'
import { SetupVaultNameProvider } from '../state/vaultName'
import { CreateKeygenVaultProvider } from './CreateKeygenVaultProvider'

export const CreateVaultFlowProviders = ({ children }: ChildrenProp) => {
  return (
    <IsInitiatingDeviceProvider value={true}>
      <GeneratedMpcSessionIdProvider>
        <GeneratedHexEncryptionKeyProvider>
          <GeneratedHexChainCodeProvider>
            <GeneratedMpcServiceNameProvider>
              <MpcServerTypeProvider initialValue="relay">
                <GeneratedMpcLocalPartyIdProvider>
                  <ServerUrlDerivedFromServerTypeProvider>
                    <CurrentKeygenTypeProvider value={'create'}>
                      <SetupVaultNameProvider>
                        <CreateKeygenVaultProvider>
                          <MpcPeersSelectionProvider>
                            {children}
                          </MpcPeersSelectionProvider>
                        </CreateKeygenVaultProvider>
                      </SetupVaultNameProvider>
                    </CurrentKeygenTypeProvider>
                  </ServerUrlDerivedFromServerTypeProvider>
                </GeneratedMpcLocalPartyIdProvider>
              </MpcServerTypeProvider>
            </GeneratedMpcServiceNameProvider>
          </GeneratedHexChainCodeProvider>
        </GeneratedHexEncryptionKeyProvider>
      </GeneratedMpcSessionIdProvider>
    </IsInitiatingDeviceProvider>
  )
}
