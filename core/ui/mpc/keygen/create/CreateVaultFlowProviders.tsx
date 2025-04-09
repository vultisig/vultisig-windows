import { CreateFlowKeygenVaultProvider } from '@core/ui/mpc/keygen/create/state/keygenVault'
import { GeneratedVaultNameProvider } from '@core/ui/mpc/keygen/create/state/vaultName'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { GeneratedHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { GeneratedMpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { ChildrenProp } from '@lib/ui/props'

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
                      <GeneratedVaultNameProvider>
                        <CreateFlowKeygenVaultProvider>
                          <MpcPeersSelectionProvider>
                            {children}
                          </MpcPeersSelectionProvider>
                        </CreateFlowKeygenVaultProvider>
                      </GeneratedVaultNameProvider>
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
