import { FieldValues } from 'react-hook-form';

import { MayaChainPool } from '../../../../lib/types/deposit';
import { ChainAction } from '../../DepositForm/chainOptionsConfig';

interface MemoParams {
  selectedChainAction?: ChainAction;
  depositFormData: FieldValues;
  bondableAsset: MayaChainPool['asset'];
  fee?: number | bigint;
}

export const generateMemo = ({
  selectedChainAction,
  depositFormData,
  bondableAsset,
  fee,
}: MemoParams): string => {
  const {
    nodeAddress,
    amount,
    lpUnits,
    customMemo,
    percentage,
    affiliateFee,
    provider,
    operatorFee,
  } = extractFormValues(depositFormData);

  // If "custom" is selected and a custom memo exists, return it directly.
  if (selectedChainAction === 'custom' && customMemo) {
    return customMemo;
  }

  const action = selectedChainAction?.toUpperCase() || '';

  switch (selectedChainAction) {
    case 'withdrawPool':
      // Format: "POOL-:percentage:affiliateFee:fee"
      return `POOL-:${percentage}:${affiliateFee}:${fee}`;

    case 'addPool':
      // Simple static memo
      return 'POOL+';

    case 'bond_with_lp':
      // If provider is given:
      //    with operatorFee: "BOND:nodeAddress:provider:operatorFee"
      //    without operatorFee: "BOND:nodeAddress:provider"
      // If no provider: "BOND:bondableAsset:lpUnits:nodeAddress"
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`;
      }
      return `BOND:${bondableAsset}:${lpUnits}:${nodeAddress}`;

    case 'bond':
      // If provider exists, return with operatorFee if present
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`;
      }
      // If no provider, include only operatorFee (no 'amount' field)
      return operatorFee
        ? `BOND:${nodeAddress}:${operatorFee}`
        : `BOND:${nodeAddress}`;
    case 'unbond_with_lp':
      // "UNBOND:bondableAsset:lpUnits:nodeAddress"
      return `UNBOND:${bondableAsset}:${lpUnits}:${nodeAddress}`;
    case 'unbond':
      return provider
        ? `UNBOND:${nodeAddress}:${amount}:${provider}`
        : `UNBOND:${nodeAddress}:${amount}`;

    default:
      // Default: If nodeAddress present: "ACTION:nodeAddress", else "ACTION"
      return nodeAddress ? `${action}:${nodeAddress}` : action;
  }
};

function extractFormValues(formData: FieldValues) {
  return {
    nodeAddress: formData.nodeAddress as string | null,
    amount: formData.amount as number | null,
    lpUnits: formData.lpUnits as number | null,
    customMemo: formData.customMemo as string | undefined,
    percentage: formData.percentage as number | null,
    affiliateFee: formData.affiliateFee as number | null,
    provider: formData.provider as string | null,
    operatorFee: formData.operatorFee as string | null,
  };
}
