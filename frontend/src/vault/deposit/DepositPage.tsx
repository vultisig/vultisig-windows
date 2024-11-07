import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { parseCoinString } from '../swap/utils';
import { DepositForm } from './DepositForm';
import { ChainAction } from './DepositForm/chainOptionsConfig';
import { DepositVerify } from './DepositVerify';

const depositSteps = ['form', 'verify'] as const;

export const DepositPage = () => {
  const [depositFormData, setDepositFormData] = useState<FieldValues>({});
  const [selectedChainAction, setSelectedChainAction] = useState<ChainAction>();
  const [{ coin }] = useAppPathParams<'vaultItemSwap'>();
  const parsedCoin = parseCoinString(coin);
  const { step, toPreviousStep, toNextStep } = useStepNavigation(depositSteps);

  const handleDepositFormSubmit = (
    data: FieldValues,
    selectedChainAction: ChainAction
  ) => {
    setDepositFormData(data);
    setSelectedChainAction(selectedChainAction);
    toNextStep();
  };

  return (
    <Match
      value={step}
      form={() => (
        <DepositForm
          onSubmit={handleDepositFormSubmit}
          coinWithActions={parsedCoin}
        />
      )}
      verify={() => (
        <DepositVerify
          selectedChainAction={selectedChainAction}
          onBack={toPreviousStep}
          depositFormData={depositFormData}
        />
      )}
    />
  );
};
