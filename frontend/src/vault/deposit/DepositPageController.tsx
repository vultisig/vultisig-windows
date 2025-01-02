import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

import { getFeeAmount } from '../../chain/tx/fee/utils/getFeeAmount';
import { coinKeyFromString } from '../../coin/Coin';
import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { ChainAction, chainActionsRecord } from './ChainAction';
import { DepositEnabledChain } from './DepositEnabledChain';
import { DepositForm } from './DepositForm';
import { DepositVerify } from './DepositVerify';
import {
  DepositChainSpecificProvider,
  useDepositChainSpecific,
} from './fee/DepositChainSpecificProvider';
import { useMemoGenerator } from './hooks/useMemoGenerator';

const depositSteps = ['form', 'verify'] as const;

export const DepositPageController = () => {
  const [{ coin: coinName }] = useAppPathParams<'deposit'>();
  const { chain: chain } = coinKeyFromString(coinName);
  const chainActionOptions = chainActionsRecord[chain as DepositEnabledChain];

  const [state, setState] = useState<{
    depositFormData: FieldValues;
    selectedChainAction: ChainAction;
  }>({
    depositFormData: {},
    selectedChainAction: chainActionOptions[0] as ChainAction,
  });

  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: depositSteps,
    onExit: useNavigateBack(),
  });

  const handleDepositFormSubmit = (data: FieldValues) => {
    setState(prevState => ({
      ...prevState,
      depositFormData: data,
    }));
    toNextStep();
  };

  const chainSpecific = useDepositChainSpecific();

  const depositFormDataWithMemo = useMemoGenerator({
    depositFormData: state.depositFormData,
    selectedChainAction: state.selectedChainAction,
    bondableAsset: state.depositFormData?.bondableAsset,
    fee: getFeeAmount(chainSpecific),
  });

  return (
    <DepositChainSpecificProvider>
      <Match
        value={step}
        form={() => (
          <DepositForm
            selectedChainAction={state.selectedChainAction}
            onSelectChainAction={action =>
              setState(prevState => ({
                ...prevState,
                selectedChainAction: action,
              }))
            }
            onSubmit={handleDepositFormSubmit}
            chainActionOptions={chainActionOptions}
            chain={chain}
          />
        )}
        verify={() => (
          <DepositVerify
            selectedChainAction={state.selectedChainAction}
            onBack={toPreviousStep}
            depositFormData={depositFormDataWithMemo}
          />
        )}
      />
    </DepositChainSpecificProvider>
  );
};
