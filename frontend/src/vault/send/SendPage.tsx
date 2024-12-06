import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { FeeSettingsProvider } from './fee/settings/state/feeSettings';
import { SendForm } from './form/SendForm';
import { SendAmountProvider } from './state/amount';
import { SendMemoProvider } from './state/memo';
import { SendReceiverProvider } from './state/receiver';
import { SendFeesProvider } from './state/sendFees';
import { SendVerify } from './verify/SendVerify';

const sendSteps = ['form', 'verify'] as const;

export const SendPage = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    onExit: useNavigateBack(),
  });

  return (
    <SendFeesProvider initialValue={null}>
      <FeeSettingsProvider>
        <SendAmountProvider initialValue={null}>
          <SendReceiverProvider initialValue="">
            <SendMemoProvider initialValue="">
              <Match
                value={step}
                form={() => <SendForm onForward={toNextStep} />}
                verify={() => <SendVerify onBack={toPreviousStep} />}
              />
            </SendMemoProvider>
          </SendReceiverProvider>
        </SendAmountProvider>
      </FeeSettingsProvider>
    </SendFeesProvider>
  );
};
