import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { parseCoinString } from '../swap/utils';
import { DepositForm } from './DepositForm';
import {
  ChainAction,
  chainDepositOptionsConfig,
  ChainWithAction,
} from './DepositForm/chainOptionsConfig';
import { DepositVerify } from './DepositVerify';
import { useMemoGenerator } from './hooks/useMemoGenerator';

const depositSteps = ['form', 'verify'] as const;

export const DepositPage = () => {
  const [depositFormData, setDepositFormData] = useState<FieldValues>({});
  const [{ coin }] = useAppPathParams<'deposit'>();
  const { chainId: chain } = parseCoinString(coin);
  const chainActionOptions =
    chainDepositOptionsConfig[chain?.toLowerCase() as ChainWithAction];

  const [selectedChainAction, setSelectedChainAction] = useState<ChainAction>(
    chainActionOptions[0] as ChainAction
  );

  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: depositSteps,
    onExit: useNavigateBack(),
  });

  const updateSelectedChainAction = (action: ChainAction) => {
    setSelectedChainAction(action);
  };

  const handleDepositFormSubmit = (
    data: FieldValues,
    selectedChainAction: ChainAction
  ) => {
    setDepositFormData(data);
    setSelectedChainAction(selectedChainAction);
    toNextStep();
  };

  const depositFormDataWithMemo = useMemoGenerator({
    depositFormData,
    selectedChainAction,
  });

  return (
    <Match
      value={step}
      form={() => (
        <DepositForm
          selectedChainAction={selectedChainAction}
          onSelectChainAction={updateSelectedChainAction}
          onSubmit={handleDepositFormSubmit}
          chainActionOptions={chainActionOptions}
          chain={chain}
        />
      )}
      verify={() => (
        <DepositVerify
          selectedChainAction={selectedChainAction}
          onBack={toPreviousStep}
          depositFormData={depositFormDataWithMemo}
        />
      )}
    />
  );
};
