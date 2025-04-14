import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
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
          <KeygenStartSessionStep
            onBack={toPreviousStep}
            onForward={toNextStep}
          />
        )}
        keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
      />
    </>
  )
}
