import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'
import { FeeSettingsProvider } from './fee/settings/state/feeSettings'
import { SendForm } from './form/SendForm'
import { SendAmountProvider } from './state/amount'
import { SendFormFieldsStateProvider } from './state/formFields'
import { SendMemoProvider } from './state/memo'
import { SendReceiverProvider } from './state/receiver'
import { SendFeesProvider } from './state/sendFees'
import { SendVerify } from './verify/SendVerify'
import { sendTerms, SendTermsProvider } from './verify/state/sendTerms'

const sendSteps = ['form', 'verify'] as const

export const SendPage = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    onExit: useNavigateBack(),
  })
  const [{ address }] = useCoreViewState<'send'>()

  return (
    <SendFormFieldsStateProvider>
      <SendFeesProvider initialValue={null}>
        <FeeSettingsProvider>
          <SendAmountProvider initialValue={null}>
            <SendReceiverProvider initialValue={address ?? ''}>
              <SendMemoProvider initialValue="">
                <Match
                  value={step}
                  form={() => <SendForm onFinish={toNextStep} />}
                  verify={() => (
                    <SendTermsProvider
                      initialValue={sendTerms.map(() => false)}
                    >
                      <SendVerify onBack={toPreviousStep} />
                    </SendTermsProvider>
                  )}
                />
              </SendMemoProvider>
            </SendReceiverProvider>
          </SendAmountProvider>
        </FeeSettingsProvider>
      </SendFeesProvider>
    </SendFormFieldsStateProvider>
  )
}
