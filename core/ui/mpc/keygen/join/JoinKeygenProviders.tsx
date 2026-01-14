import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChildrenProp } from '@lib/ui/props'

import { KeyImportChainsProvider } from '../keyimport/state/keyImportChains'
import { JoinKeygenVaultProvider } from './state/keygenVault'

export const JoinKeygenProviders = ({ children }: ChildrenProp) => {
  const [{ keygenOperation, keygenMsg }] = useCoreViewState<'joinKeygen'>()

  const { sessionId, useVultisigRelay, serviceName, encryptionKeyHex } =
    keygenMsg

  const serverType = useVultisigRelay ? 'relay' : 'local'

  const keyImportChains = 'chains' in keygenMsg ? keygenMsg.chains : []

  return (
    <IsInitiatingDeviceProvider value={false}>
      <MpcServiceNameProvider value={serviceName}>
        <MpcServerTypeProvider initialValue={serverType}>
          <MpcSessionIdProvider value={sessionId}>
            <KeygenOperationProvider value={keygenOperation}>
              <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                <KeyImportChainsProvider value={keyImportChains}>
                  <JoinKeygenVaultProvider>{children}</JoinKeygenVaultProvider>
                </KeyImportChainsProvider>
              </CurrentHexEncryptionKeyProvider>
            </KeygenOperationProvider>
          </MpcSessionIdProvider>
        </MpcServerTypeProvider>
      </MpcServiceNameProvider>
    </IsInitiatingDeviceProvider>
  )
}
