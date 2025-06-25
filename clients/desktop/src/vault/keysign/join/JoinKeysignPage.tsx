import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { JoinKeysignProviders } from '@core/ui/mpc/keysign/join/JoinKeysignProviders'
import { JoinKeysignVerifyStep } from '@core/ui/mpc/keysign/join/JoinKeysignVerifyStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '@core/ui/mpc/keysign/state/keysignMessagePayload'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

import { JoinMpcServerUrlProvider } from '../../../mpc/serverType/JoinMpcServerUrlProvider'
import { KeysignActionProvider } from '../action/KeysignActionProvider'

export const JoinKeysignPage = () => {
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <JoinKeysignProviders>
      <JoinMpcServerUrlProvider mpcSession="keysign">
        <StepTransition
          from={({ onFinish }) => <JoinKeysignVerifyStep onFinish={onFinish} />}
          to={({ onBack }) => (
            <JoinMpcSessionFlow
              value="keysign"
              render={() => (
                <KeysignActionProvider>
                  <KeysignMessagePayloadProvider value={keysignMessagePayload}>
                    <KeysignSigningStep onBack={onBack} />
                  </KeysignMessagePayloadProvider>
                </KeysignActionProvider>
              )}
            />
          )}
        />
      </JoinMpcServerUrlProvider>
    </JoinKeysignProviders>
  )
}
