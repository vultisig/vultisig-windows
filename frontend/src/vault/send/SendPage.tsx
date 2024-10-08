import { useCallback, useState } from 'react';

import { Match } from '../../lib/ui/base/Match';
import { SendForm } from './form/SendForm';
import { SendAmountProvider } from './state/amount';
import { SendReceiverProvider } from './state/receiver';
import { SendVerify } from './verify/SendVerify';

const sendSteps = ['form', 'verify'] as const;
type SendStep = (typeof sendSteps)[number];

export const SendPage = () => {
  const [step, setStep] = useState<SendStep>(sendSteps[0]);

  const toNextStep = useCallback(() => {
    setStep(prev => sendSteps[sendSteps.indexOf(prev) + 1]);
  }, []);

  const toPrevStep = useCallback(() => {
    setStep(prev => sendSteps[sendSteps.indexOf(prev) - 1]);
  }, []);

  return (
    <SendAmountProvider initialValue={null}>
      <SendReceiverProvider initialValue="">
        <Match
          value={step}
          form={() => <SendForm onForward={toNextStep} />}
          verify={() => <SendVerify onBack={toPrevStep} />}
        />
      </SendReceiverProvider>
    </SendAmountProvider>
  );
};
