import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '@core/ui/mpc/keygen/reshare/verify/ReshareVerifyStep'
import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

const reshareVaultSteps = ['peers', 'verify', 'startSession', 'keygen'] as const

export const ReshareSecureVaultFlow = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  return (
    <Match
      value={step}
      peers={() => <KeygenPeerDiscoveryStep onFinish={toNextStep} />}
      verify={() => (
        <ReshareVerifyStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      startSession={() => (
        <StartMpcSessionStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
    />
  )
}
