import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

const steps = ['name', 'peers', 'startSession', 'keygen'] as const

const lastEditableStep = steps[0]

export const CreateSecureVaultFlow = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <Match
      value={step}
      name={() => <CreateVaultNameStep onFinish={toNextStep} />}
      peers={() => (
        <KeygenPeerDiscoveryStep
          onBack={() => setStep(steps[0])}
          onFinish={toNextStep}
        />
      )}
      startSession={() => (
        <StartMpcSessionStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => <KeygenFlow onBack={() => setStep(lastEditableStep)} />}
    />
  )
}
