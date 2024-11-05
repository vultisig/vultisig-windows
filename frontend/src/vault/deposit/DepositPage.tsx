import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { parseCoinString } from '../swap/utils';
import { DepositForm } from './DepositForm';
import { DepositVerify } from './DepositVerify';

const depositSteps = ['form', 'verify'] as const;

export const DepositPage = () => {
  const [{ coin }] = useAppPathParams<'vaultItemSwap'>();
  const parsedCoin = parseCoinString(coin);
  const { step, toPreviousStep, toNextStep } = useStepNavigation(depositSteps);

  return (
    <Match
      value={step}
      form={() => (
        <DepositForm onSubmit={toNextStep} coinWithActions={parsedCoin} />
      )}
      verify={() => <DepositVerify onBack={toPreviousStep} />}
    />
  );
};
