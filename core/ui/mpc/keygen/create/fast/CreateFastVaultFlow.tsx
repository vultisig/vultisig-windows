import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { FastVaultSetupForm } from './FastVaultSetupForm'

const steps = ['form', 'keygen'] as const

export const CreateFastVaultFlow = () => {
  const { goBack } = useCore()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      form={() => (
        <FastVaultSetupForm onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      keygen={() => <FastKeygenFlow onBack={toPreviousStep} />}
    />
  )
}
