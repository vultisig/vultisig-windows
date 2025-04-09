import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { ChildrenProp } from '@lib/ui/props'

import { GeneratedMpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '../../../mpc/peers/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { GeneratedMpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
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
            <GeneratedServiceNameProvider>
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
            </GeneratedServiceNameProvider>
          </GeneratedHexChainCodeProvider>
        </GeneratedHexEncryptionKeyProvider>
      </GeneratedMpcSessionIdProvider>
    </IsInitiatingDeviceProvider>
  )
}
