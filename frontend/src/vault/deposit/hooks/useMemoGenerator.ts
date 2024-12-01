import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';

import { Coin } from '../../../lib/types/coin';
import { ChainAction } from '../DepositForm/chainOptionsConfig';

type UseMemoGeneratorProps = {
  depositFormData: FieldValues;
  selectedChainAction?: ChainAction;
  coinName: Coin['ticker'];
  fee?: number;
};

export const useMemoGenerator = ({
  depositFormData = {},
  selectedChainAction,
  coinName,
  fee,
}: UseMemoGeneratorProps): FieldValues => {
  const enhancedDepositFormData = useMemo(() => {
    const upperCaseChainAction = selectedChainAction?.toUpperCase() || '';
    const nodeAddress = depositFormData['nodeAddress'] as string | null;
    const amount = depositFormData['amount'] as number | null;
    const lpUnits = depositFormData['lpUnits'] as number | null;
    const customMemo = depositFormData['customMemo'] as string;
    const percentage = depositFormData['percentage'] as number | null;
    const affiliateFee = depositFormData['affiliateFee'] as number | null;
    const provider = depositFormData['provider'] as string | null;

    const generateMemo = (): string => {
      if (selectedChainAction === 'custom' && customMemo) {
        return customMemo;
      }

      switch (selectedChainAction) {
        case 'withdrawPool':
          return `POOL-:${percentage}:${affiliateFee}:${fee}`;
        case 'addPool':
          return 'POOL+';
        case 'bond_with_lp':
          return `BOND:${coinName}:${lpUnits}:${nodeAddress}`;
        case 'unbond_with_lp':
          return `UNBOND:${coinName}:${lpUnits}:${nodeAddress}`;
        case 'unbond':
          return `${upperCaseChainAction}:${nodeAddress}:${amount}:${provider ? provider : ''}`;
        default:
          return nodeAddress
            ? `${upperCaseChainAction}:${nodeAddress || '+'}`
            : upperCaseChainAction;
      }
    };

    const memoValue = generateMemo();
    return { ...depositFormData, memo: memoValue };
  }, [selectedChainAction, depositFormData, fee, coinName]);

  return enhancedDepositFormData;
};
