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
    let memoValue = '';
    const upperCaseSelectedChainAction = selectedChainAction?.toUpperCase();
    if (selectedChainAction === 'custom' && depositFormData['customMemo']) {
      memoValue = depositFormData['customMemo'] as string;
    } else if (selectedChainAction === 'withdrawPool') {
      memoValue = 'POOL-:1:vi:50';
    } else if (selectedChainAction === 'addPool') {
      memoValue += 'POOL+';
    } else if (selectedChainAction === 'bond_with_lp') {
      memoValue += 'BOND';
    } else if (selectedChainAction === 'unbond_with_lp') {
      memoValue += 'UNBOND';
    } else if (selectedChainAction && depositFormData['nodeAddress']) {
      memoValue = `${upperCaseSelectedChainAction}:${depositFormData['nodeAddress'] || '+'}`;

      if (selectedChainAction === 'unbond' && depositFormData['amount']) {
        memoValue += `:${depositFormData['amount']}`;
      }
    } else {
      memoValue = `${upperCaseSelectedChainAction || ''}`;
    }

    return { ...depositFormData, memo: memoValue };
  }, [depositFormData, selectedChainAction]);

  return enhancedDepositFormData;
};
