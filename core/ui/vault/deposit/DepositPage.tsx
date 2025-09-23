import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'

import { useCore } from '../../state/core'
import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'

const depositSteps = ['form', 'verify'] as const

export const DepositPage = () => {
  const [formState, setFormState] = useState<FieldValues>({})

  const { goBack } = useCore()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: depositSteps,
    onExit: goBack,
  })

  const handleDepositFormSubmit = (data: FieldValues) => {
    setFormState(prevState => ({
      ...prevState,
      depositFormData: data,
    }))
    toNextStep()
  }

  return (
    <Match
      value={step}
      form={() => <DepositForm onSubmit={handleDepositFormSubmit} />}
      verify={() => (
        <DepositVerify
          onBack={toPreviousStep}
          depositFormData={formState.depositFormData}
        />
      )}
    />
  )
}
