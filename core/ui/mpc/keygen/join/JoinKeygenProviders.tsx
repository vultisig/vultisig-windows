import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { ChildrenProp } from '@lib/ui/props'

import { JoinKeygenVaultProvider } from './state/keygenVault'

export const JoinKeygenProviders = ({ children }: ChildrenProp) => {
  const { keygenType, keygenMsg } = useCorePathState<'joinKeygen'>()

  const { sessionId, useVultisigRelay, serviceName, encryptionKeyHex } =
    keygenMsg

  const serverType = useVultisigRelay ? 'relay' : 'local'

  return (
    <IsInitiatingDeviceProvider value={false}>
      <MpcServiceNameProvider value={serviceName}>
        <MpcServerTypeProvider initialValue={serverType}>
          <MpcSessionIdProvider value={sessionId}>
            <CurrentKeygenTypeProvider value={keygenType}>
              <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                <JoinKeygenVaultProvider>{children}</JoinKeygenVaultProvider>
              </CurrentHexEncryptionKeyProvider>
            </CurrentKeygenTypeProvider>
          </MpcSessionIdProvider>
        </MpcServerTypeProvider>
      </MpcServiceNameProvider>
    </IsInitiatingDeviceProvider>
  )
}
