import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeysignActionProvider } from '../action/KeysignActionProvider'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider'
import { KeysignVaultGuard } from './KeysignVaultGuard'
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep'

export const JoinKeysignPage = () => {
  const { keysignMsg } = useAppPathState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex } = keysignMsg

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <IsInitiatingDeviceProvider value={false}>
      <KeysignVaultGuard>
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
      </KeysignVaultGuard>
    </IsInitiatingDeviceProvider>
  )
}
