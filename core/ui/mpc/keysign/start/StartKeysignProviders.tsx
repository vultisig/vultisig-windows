import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'

export const StartKeysignProviders = ({ children }: ChildrenProp) => {
  const { localPartyId } = useCurrentVault()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLocalPartyIdProvider value={localPartyId}>
        <GeneratedMpcServiceNameProvider>
          <GeneratedMpcSessionIdProvider>
            <GeneratedHexEncryptionKeyProvider>
              <MpcServerTypeProvider initialValue="relay">
                <ServerUrlDerivedFromServerTypeProvider>
                  {children}
                </ServerUrlDerivedFromServerTypeProvider>
              </MpcServerTypeProvider>
            </GeneratedHexEncryptionKeyProvider>
          </GeneratedMpcSessionIdProvider>
        </GeneratedMpcServiceNameProvider>
      </MpcLocalPartyIdProvider>
    </IsInitiatingDeviceProvider>
  )
}
