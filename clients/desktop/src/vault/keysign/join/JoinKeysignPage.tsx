import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { JoinKeysignVaultGuard } from '@core/ui/mpc/keysign/join/JoinKeysignVaultGuard'
import { JoinKeysignVerifyStep } from '@core/ui/mpc/keysign/join/JoinKeysignVerifyStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

import { JoinMpcServerUrlProvider } from '../../../mpc/serverType/JoinMpcServerUrlProvider'
import { KeysignActionProvider } from '../action/KeysignActionProvider'

export const JoinKeysignPage = () => {
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex, useVultisigRelay, serviceName } =
    keysignMsg

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  const serverType = useVultisigRelay ? 'relay' : 'local'

  return (
    <IsInitiatingDeviceProvider value={false}>
      <JoinKeysignVaultGuard>
        <MpcServerTypeProvider initialValue={serverType}>
          <MpcServiceNameProvider value={serviceName}>
            <JoinMpcServerUrlProvider mpcSession="keysign">
              <MpcSessionIdProvider value={sessionId}>
                <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                  <StepTransition
                    from={({ onFinish }) => (
                      <JoinKeysignVerifyStep onFinish={onFinish} />
                    )}
                    to={({ onBack }) => (
                      <JoinMpcSessionFlow
                        render={() => (
                          <KeysignActionProvider>
                            <KeysignSigningStep
                              payload={keysignMessagePayload}
                              onBack={onBack}
                            />
                          </KeysignActionProvider>
                        )}
                      />
                    )}
                  />
                </CurrentHexEncryptionKeyProvider>
              </MpcSessionIdProvider>
            </JoinMpcServerUrlProvider>
          </MpcServiceNameProvider>
        </MpcServerTypeProvider>
      </JoinKeysignVaultGuard>
    </IsInitiatingDeviceProvider>
  )
}
