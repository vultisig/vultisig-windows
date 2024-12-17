import { useState } from 'react';
import { FieldValues } from 'react-hook-form';

import { coinKeyFromString } from '../../coin/Coin';
import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { DepositForm } from './DepositForm';
import {
  ChainAction,
  chainDepositOptionsConfig,
  ChainWithAction,
} from './DepositForm/chainOptionsConfig';
import { DepositVerify } from './DepositVerify';
import {
  DepositSpecificTxInfoProvider,
  useSendSpecificTxInfo,
} from './fee/DepositSpecificTxInfoProvider';
import { useMemoGenerator } from './hooks/useMemoGenerator';

const depositSteps = ['form', 'verify'] as const;

export const DepositPageController = () => {
  const [{ coin: coinName }] = useAppPathParams<'deposit'>();
  const { chain: chain } = coinKeyFromString(coinName);
  const chainActionOptions =
    chainDepositOptionsConfig[chain?.toLowerCase() as ChainWithAction];

  const [state, setState] = useState<{
    depositFormData: FieldValues;
    selectedChainAction: ChainAction;
  }>({
    depositFormData: {},
    selectedChainAction: chainActionOptions[0] as ChainAction,
  });

  const txInfo = useSendSpecificTxInfo();
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

  const depositFormDataWithMemo = useMemoGenerator({
    depositFormData: state.depositFormData,
    selectedChainAction: state.selectedChainAction,
    bondableAsset: state.depositFormData?.bondableAsset,
    fee: txInfo.fee,
  });

  return (
    <DepositSpecificTxInfoProvider>
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
    </DepositSpecificTxInfoProvider>
  );
};
