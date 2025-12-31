import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { FastKeysignServerStep } from '@core/ui/mpc/keysign/fast/FastKeysignServerStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { KeysignMessagePayloadProvider } from '../state/keysignMessagePayload'

const keysignSteps = ['server', 'keysign'] as const

export const StartFastKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
}: KeysignActionProviderProp) => {
  const { goBack } = useCore()
  const [{ keysignPayload, password }] = useCoreViewState<'keysign'>()
  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      server={() => (
        <FastKeysignServerStep
          onFinish={toNextStep}
          password={shouldBePresent(password)}
        />
      )}
      keysign={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => <WaitForServerStep onFinish={onFinish} />}
          key="peers"
          to={({ value }) => (
            <MpcPeersProvider value={value}>
              <StartMpcSessionFlow
                render={() => (
                  <KeysignActionProvider>
                    <KeysignMessagePayloadProvider value={keysignPayload}>
                      <KeysignSigningStep />
                    </KeysignMessagePayloadProvider>
                  </KeysignActionProvider>
                )}
                value="keysign"
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
