import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionStep } from '@core/ui/mpc/keygen/join/JoinMpcSessionStep'
import { WaitMpcSessionStart } from '@core/ui/mpc/session/WaitMpcSessionStart'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'
import { JoinKeygenServerUrlProvider } from './JoinKeygenServerUrlProvider'

const keygenSteps = ['session', 'keygen'] as const

export const JoinKeygenPage = () => {
  const onExit = useNavigateBack()

  const { step, toNextStep } = useStepNavigation({
    steps: keygenSteps,
    onExit,
  })

  return (
    <JoinKeygenProviders>
      <JoinKeygenServerUrlProvider>
        <MpcMediatorManager />
        <Match
          value={step}
          session={() => <JoinMpcSessionStep onFinish={toNextStep} />}
          keygen={() => (
            <ValueTransfer<string[]>
              from={({ onFinish }) => (
                <WaitMpcSessionStart value="keygen" onFinish={onFinish} />
              )}
              to={({ value }) => (
                <MpcPeersProvider value={value}>
                  <JoinKeygenActionProvider>
                    <KeygenFlow onBack={onExit} />
                  </JoinKeygenActionProvider>
                </MpcPeersProvider>
              )}
            />
          )}
        />
      </JoinKeygenServerUrlProvider>
    </JoinKeygenProviders>
  )
}
