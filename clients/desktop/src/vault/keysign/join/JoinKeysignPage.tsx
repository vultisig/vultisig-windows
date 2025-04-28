import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { JoinKeysignVaultGuard } from '@core/ui/mpc/keysign/join/JoinKeysignVaultGuard'
import { JoinKeysignVerifyStep } from '@core/ui/mpc/keysign/join/JoinKeysignVerifyStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

import { KeysignActionProvider } from '../action/KeysignActionProvider'
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider'

export const JoinKeysignPage = () => {
  const { keysignMsg } = useCorePathState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex } = keysignMsg

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <IsInitiatingDeviceProvider value={false}>
      <JoinKeysignVaultGuard>
        <KeysignServerUrlProvider>
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
        </KeysignServerUrlProvider>
      </JoinKeysignVaultGuard>
    </IsInitiatingDeviceProvider>
  )
}
