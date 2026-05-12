import { CreateFlowKeygenVaultProvider } from '@core/ui/mpc/keygen/create/state/keygenVault'
import { GeneratedHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { IsTssBatchingProvider } from '@core/ui/mpc/state/isTssBatching'
import { GeneratedMpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { useIsTssBatchingEnabled } from '@core/ui/storage/tssBatchingEnabled'
import { ChildrenProp } from '@lib/ui/props'

export const KeygenSessionProviders = ({ children }: ChildrenProp) => {
  const isTssBatchingEnabled = useIsTssBatchingEnabled()
  return (
    <IsInitiatingDeviceProvider value={true}>
      <IsTssBatchingProvider value={isTssBatchingEnabled}>
        <GeneratedMpcSessionIdProvider>
          <GeneratedHexEncryptionKeyProvider>
            <GeneratedHexChainCodeProvider>
              <GeneratedMpcServiceNameProvider>
                <MpcServerTypeProvider initialValue="relay">
                  <GeneratedMpcLocalPartyIdProvider>
                    <ServerUrlDerivedFromServerTypeProvider>
                      <CreateFlowKeygenVaultProvider>
                        <MpcPeersSelectionProvider>
                          {children}
                        </MpcPeersSelectionProvider>
                      </CreateFlowKeygenVaultProvider>
                    </ServerUrlDerivedFromServerTypeProvider>
                  </GeneratedMpcLocalPartyIdProvider>
                </MpcServerTypeProvider>
              </GeneratedMpcServiceNameProvider>
            </GeneratedHexChainCodeProvider>
          </GeneratedHexEncryptionKeyProvider>
        </GeneratedMpcSessionIdProvider>
      </IsTssBatchingProvider>
    </IsInitiatingDeviceProvider>
  )
}
