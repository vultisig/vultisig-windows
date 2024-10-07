import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Match } from '../../lib/ui/base/Match';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { SendForm } from './SendForm';
import { SendAmountProvider } from './state/amount';
import { SendReceiverProvider } from './state/receiver';
import { SendVerify } from './verify/SendVerify';

const sendSteps = ['form', 'verify'] as const;
type SendStep = (typeof sendSteps)[number];

export const SendPage = () => {
  const { t } = useTranslation();

  const [step, setStep] = useState<SendStep>(sendSteps[0]);

  const toNextStep = useCallback(() => {
    setStep(prev => sendSteps[sendSteps.indexOf(prev) + 1]);
  }, []);

  const toPrevStep = useCallback(() => {
    setStep(prev => sendSteps[sendSteps.indexOf(prev) - 1]);
  }, []);

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <SendAmountProvider initialValue={null}>
        <SendReceiverProvider initialValue="">
          <Match
            value={step}
            form={() => <SendForm onForward={toNextStep} />}
            verify={() => (
              <SendVerify onForward={toNextStep} onBack={toPrevStep} />
            )}
          />
        </SendReceiverProvider>
      </SendAmountProvider>
    </>
  );
};
