import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { SwapForm } from '../form/SwapForm';
import { FromAmountProvider } from '../state/fromAmount';
import { ToCoinProvider } from '../state/toCoin';
import { SwapVerify } from '../verify/SwapVerify';

const sendSteps = ['form', 'verify'] as const;

export const SwapPage = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    onExit: useNavigateBack(),
  });

  return (
    <FromAmountProvider initialValue={null}>
      <ToCoinProvider>
        <Match
          value={step}
          form={() => <SwapForm onForward={toNextStep} />}
          verify={() => <SwapVerify onBack={toPreviousStep} />}
        />
      </ToCoinProvider>
    </FromAmountProvider>
  );
};
