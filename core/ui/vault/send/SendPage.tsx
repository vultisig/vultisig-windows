import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { useCore } from '../../state/core'
import { SendForm } from './form/SendForm'
import { SendFormFieldsStateProvider } from './state/formFields'
import { SendReceiverProvider } from './state/receiver'
import { SendReceiverLabelProvider } from './state/receiverLabel'
import { SendVerify } from './verify/SendVerify'

const sendSteps = ['form', 'verify'] as const

/**
 * The send flow: the form, and the review sheet that opens over it. The form
 * stays mounted underneath the sheet so closing the review lands back on the
 * fields exactly as they were left.
 */
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
        <SendReceiverLabelProvider>
          <SendForm onFinish={toNextStep} />
          {step === 'verify' && <SendVerify onBack={toPreviousStep} />}
        </SendReceiverLabelProvider>
      </SendReceiverProvider>
    </SendFormFieldsStateProvider>
  )
}
