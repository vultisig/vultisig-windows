import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { JoinKeysignProviders } from '@core/ui/mpc/keysign/join/JoinKeysignProviders'
import { JoinKeysignVerifyStep } from '@core/ui/mpc/keysign/join/JoinKeysignVerifyStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

export const JoinKeysignPage = () => {
  const [{ keysignMsg }] = useCoreViewState<'joinKeysign'>()

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

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
                  <KeysignSigningStep
                    payload={keysignMessagePayload}
                    onBack={onBack}
                  />
                </KeysignActionProvider>
              )}
            />
          )}
        />
      </MpcServerUrlProvider>
    </JoinKeysignProviders>
  )
}
