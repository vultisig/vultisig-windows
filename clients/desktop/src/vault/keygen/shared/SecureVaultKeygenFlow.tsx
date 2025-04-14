import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'

const reshareVaultSteps = [
  'joinSession',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const SecureVaultKeygenFlow = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  return (
    <>
      <MpcMediatorManager />
      <Match
        value={step}
        joinSession={() => <JoinKeygenSessionStep onForward={toNextStep} />}
        peers={() => <KeygenPeerDiscoveryStep onForward={toNextStep} />}
        verify={() => (
          <ReshareVerifyStep onBack={toPreviousStep} onForward={toNextStep} />
        )}
        startSession={() => (
          <StartMpcSessionStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
      />
    </>
  )
}
