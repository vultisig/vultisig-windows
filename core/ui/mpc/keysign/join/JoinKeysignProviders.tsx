import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChildrenProp } from '@lib/ui/props'

import { JoinKeysignVaultGuard } from './JoinKeysignVaultGuard'

export const JoinKeysignProviders = ({ children }: ChildrenProp) => {
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex, useVultisigRelay, serviceName } =
    keysignMsg

  const serverType = useVultisigRelay ? 'relay' : 'local'

  return (
    <IsInitiatingDeviceProvider value={false}>
      <JoinKeysignVaultGuard>
        <MpcServerTypeProvider initialValue={serverType}>
          <MpcServiceNameProvider value={serviceName}>
            <MpcSessionIdProvider value={sessionId}>
              <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                {children}
              </CurrentHexEncryptionKeyProvider>
            </MpcSessionIdProvider>
          </MpcServiceNameProvider>
        </MpcServerTypeProvider>
      </JoinKeysignVaultGuard>
    </IsInitiatingDeviceProvider>
  )
}
