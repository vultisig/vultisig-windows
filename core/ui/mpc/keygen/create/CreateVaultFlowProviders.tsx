import { CreateFlowKeygenVaultProvider } from '@core/ui/mpc/keygen/create/state/keygenVault'
import { GeneratedVaultNameProvider } from '@core/ui/mpc/keygen/create/state/vaultName'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
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
                    <CurrentKeygenOperationTypeProvider
                      value={{ operation: 'create' }}
                    >
                      <GeneratedVaultNameProvider>
                        <CreateFlowKeygenVaultProvider>
                          <MpcPeersSelectionProvider>
                            {children}
                          </MpcPeersSelectionProvider>
                        </CreateFlowKeygenVaultProvider>
                      </GeneratedVaultNameProvider>
                    </CurrentKeygenOperationTypeProvider>
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
