import { FieldValues } from 'react-hook-form';

import { MayaChainPool } from '../../../../lib/types/deposit';
import { ChainAction } from '../../DepositForm/chainOptionsConfig';

export const generateMemo = (params: {
  selectedChainAction?: ChainAction;
  depositFormData: FieldValues;
  bondableAsset: MayaChainPool['asset'];
  fee?: number | bigint;
}): string => {
  const { selectedChainAction, depositFormData, bondableAsset, fee } = params;
  const upperCaseChainAction = selectedChainAction?.toUpperCase() || '';
  const nodeAddress = depositFormData['nodeAddress'] as string | null;
  const amount = depositFormData['amount'] as number | null;
  const lpUnits = depositFormData['lpUnits'] as number | null;
  const customMemo = depositFormData['customMemo'] as string;
  const percentage = depositFormData['percentage'] as number | null;
  const affiliateFee = depositFormData['affiliateFee'] as number | null;
  const provider = depositFormData['provider'] as string | null;

  if (selectedChainAction === 'custom' && customMemo) {
    return customMemo;
  }

  switch (selectedChainAction) {
    case 'withdrawPool':
      return `POOL-:${percentage}:${affiliateFee}:${fee}`;
    case 'addPool':
      return 'POOL+';
    case 'bond_with_lp':
      return `BOND:${bondableAsset}:${lpUnits}:${nodeAddress}`;
    case 'unbond_with_lp':
      return `UNBOND:${bondableAsset}:${lpUnits}:${nodeAddress}`;
    case 'unbond':
      return `${upperCaseChainAction}:${nodeAddress}:${amount}:${provider || ''}`;
    default:
      return nodeAddress
        ? `${upperCaseChainAction}:${nodeAddress}`
        : upperCaseChainAction;
  }
};
