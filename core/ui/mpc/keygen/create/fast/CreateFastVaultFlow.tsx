import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { SetServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/SetServerPasswordStep'
import { ServerPasswordHintStep } from '@core/ui/mpc/keygen/create/fast/server/password-hint/ServerPasswordHintStep'
import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

const steps = ['name', 'email', 'password', 'hint', 'keygen'] as const

export const CreateFastVaultFlow = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <Match
      value={step}
      name={() => <CreateVaultNameStep onFinish={toNextStep} />}
      email={() => (
        <ServerEmailStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      password={() => (
        <SetServerPasswordStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      hint={() => (
        <ServerPasswordHintStep onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => <FastKeygenFlow onBack={toPreviousStep} />}
    />
  )
}
