import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { JoinKeysignProviders } from '@core/ui/mpc/keysign/join/JoinKeysignProviders'
import { JoinKeysignVerifyStep } from '@core/ui/mpc/keysign/join/JoinKeysignVerifyStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '@core/ui/mpc/keysign/state/keysignMessagePayload'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo, useRef } from 'react'

export const JoinKeysignPage = () => {
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()
  const navigate = useCoreNavigate()
  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )
  const hasFinishedRef = useRef(false)
  const handleFinish = () => {
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true
    } else {
      navigate({ id: 'vault' })
    }
  }

  return (
    <JoinKeysignProviders>
      <MpcServerUrlProvider value={mpcServerUrl.relay}>
        <StepTransition
          from={({ onFinish }) => <JoinKeysignVerifyStep onFinish={onFinish} />}
          to={({ onBack }) => (
            <JoinMpcSessionFlow
              value="keysign"
              render={() => (
                <KeysignActionProvider>
                  <KeysignMessagePayloadProvider value={keysignMessagePayload}>
                    <KeysignSigningStep
                      onBack={onBack}
                      onFinish={handleFinish}
                    />
                  </KeysignMessagePayloadProvider>
                </KeysignActionProvider>
              )}
            />
          )}
        />
      </MpcServerUrlProvider>
    </JoinKeysignProviders>
  )
}
