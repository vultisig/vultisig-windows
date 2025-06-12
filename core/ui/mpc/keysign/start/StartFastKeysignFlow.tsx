import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeysignServerStep } from '@core/ui/mpc/keysign/fast/FastKeysignServerStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'

const keysignSteps = ['server', 'keysign'] as const

export const StartFastKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<TxResult>>) => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <Match
      value={step}
      server={() => (
        <ValueTransfer<{ password: string }>
          key="password"
          from={({ onFinish }) => <ServerPasswordStep onFinish={onFinish} />}
          to={({ value: { password } }) => (
            <FastKeysignServerStep onFinish={toNextStep} password={password} />
          )}
        />
      )}
      keysign={() => (
        <ValueTransfer<string[]>
          key="peers"
          from={({ onFinish }) => {
            return (
              <WaitForServerStep
                onBack={toPreviousStep}
                onPeersChange={onFinish}
              />
            )
          }}
          to={({ value }) => (
            <MpcPeersProvider value={value}>
              <StartMpcSessionFlow
                value="keysign"
                render={() => (
                  <KeysignActionProvider>
                    <KeysignSigningStep
                      payload={keysignPayload}
                      onFinish={onFinish}
                    />
                  </KeysignActionProvider>
                )}
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
