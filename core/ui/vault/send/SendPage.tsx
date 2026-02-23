import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCore } from '../../state/core'
import { SendForm } from './form/SendForm'
import { SendFormFieldsStateProvider } from './state/formFields'
import { SendReceiverProvider } from './state/receiver'
import { SendVerify } from './verify/SendVerify'

const sendSteps = ['form', 'verify'] as const

export const SendPage = () => {
  const { goBack } = useCore()
  const [{ address, skipToVerify }] = useCoreViewState<'send'>()
  const initialStep = skipToVerify ? ('verify' as const) : undefined
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    initialStep,
    onExit: goBack,
  })

  return (
    <SendFormFieldsStateProvider>
      <SendReceiverProvider initialValue={address ?? ''}>
        <Match
          value={step}
          form={() => <SendForm onFinish={toNextStep} />}
          verify={() => <SendVerify onBack={toPreviousStep} />}
        />
      </SendReceiverProvider>
    </SendFormFieldsStateProvider>
  )
}
