import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { SetServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/SetServerPasswordStep'
import { ServerPasswordHintStep } from '@core/ui/mpc/keygen/create/fast/server/password-hint/ServerPasswordHintStep'
import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

const steps = ['name', 'email', 'password', 'hint', 'keygen'] as const

export const CreateFastVaultFlow = () => {
  const { goBack } = useCore()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: goBack,
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
