import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeysignServerStep } from '@core/ui/mpc/keysign/fast/FastKeysignServerStep'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { WaitForServerStep } from '../../fast/WaitForServerStep'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { OnFinishProp } from '@lib/ui/props'
import { ExecuteTxResultWithEncoded } from '@core/chain/tx/execute/ExecuteTxResolver'

const keysignSteps = ['password', 'server', 'keysign'] as const

export const StartFastKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<string | ExecuteTxResultWithEncoded>>) => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <PasswordProvider initialValue="">
      <Match
        value={step}
        password={() => <ServerPasswordStep onFinish={toNextStep} />}
        server={() => <FastKeysignServerStep onFinish={toNextStep} />}
        keysign={() => (
          <ValueTransfer<string[]>
            from={({ onFinish }) => (
              <WaitForServerStep onBack={toPreviousStep} onFinish={onFinish} />
            )}
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
    </PasswordProvider>
  )
}
