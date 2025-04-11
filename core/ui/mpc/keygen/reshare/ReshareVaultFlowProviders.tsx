import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { ChildrenProp } from '@lib/ui/props'

import { CurrentVaultHexChainCodeProvider } from '../../state/currentHexChainCode'
import { CurrentVaultLocalPartyIdProvider } from '../../state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '../../state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '../../state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '../../state/mpcServiceName'
import { ServerUrlDerivedFromServerTypeProvider } from '../../state/serverUrlDerivedFromServerType'
import { CurrentKeygenVaultProvider } from '../state/keygenVault'

export const ReshareVaultFlowProviders = ({ children }: ChildrenProp) => {
  return (
    <CurrentKeygenVaultProvider>
      <CurrentVaultLocalPartyIdProvider>
        <MpcServerTypeProvider initialValue="relay">
          <ServerUrlDerivedFromServerTypeProvider>
            <CurrentVaultHexChainCodeProvider>
              <IsInitiatingDeviceProvider value={true}>
                <GeneratedMpcServiceNameProvider>
                  <MpcPeersSelectionProvider>
                    {children}
                  </MpcPeersSelectionProvider>
                </GeneratedMpcServiceNameProvider>
              </IsInitiatingDeviceProvider>
            </CurrentVaultHexChainCodeProvider>
          </ServerUrlDerivedFromServerTypeProvider>
        </MpcServerTypeProvider>
      </CurrentVaultLocalPartyIdProvider>
    </CurrentKeygenVaultProvider>
  )
}
