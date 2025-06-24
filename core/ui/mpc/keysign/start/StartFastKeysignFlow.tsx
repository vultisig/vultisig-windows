import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeysignServerStep } from '@core/ui/mpc/keysign/fast/FastKeysignServerStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { OnFinishProp } from '@lib/ui/props'

const keysignSteps = ['server', 'keysign'] as const

export const StartFastKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<TxResult>>) => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()
  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <Match
      value={step}
      server={() => (
        <ValueTransfer<{ password: string }>
          from={({ onFinish }) => <ServerPasswordStep onFinish={onFinish} />}
          key="password"
          to={({ value: { password } }) => (
            <FastKeysignServerStep onFinish={toNextStep} password={password} />
          )}
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
                    <KeysignSigningStep
                      payload={keysignPayload}
                      onFinish={onFinish}
                    />
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
