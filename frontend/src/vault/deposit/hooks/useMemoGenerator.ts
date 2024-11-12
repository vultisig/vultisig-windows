import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';

import { ChainAction } from '../DepositForm/chainOptionsConfig';

type UseMemoGeneratorProps = {
  depositFormData: FieldValues;
  selectedChainAction?: ChainAction;
};

export const useMemoGenerator = ({
  depositFormData,
  selectedChainAction,
}: UseMemoGeneratorProps): FieldValues => {
  const enhancedDepositFormData = useMemo(() => {
    let memoValue;

    if (selectedChainAction === 'custom' && depositFormData['customMemo']) {
      memoValue = depositFormData['customMemo'] as string;
    } else {
      const nodeAddress = depositFormData['nodeAddress'] as string;
      memoValue = `${selectedChainAction}:${nodeAddress || '+'}`;
    }

    return { ...depositFormData, memo: memoValue };
  }, [depositFormData, selectedChainAction]);

  return enhancedDepositFormData;
};
