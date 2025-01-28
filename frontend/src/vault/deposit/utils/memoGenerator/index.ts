import { FieldValues } from 'react-hook-form';

import { nativeSwapAffiliateConfig } from '../../../../chain/swap/native/nativeSwapAffiliateConfig';
import { chainFeeCoin } from '../../../../coin/chainFeeCoin';
import { MayaChainPool } from '../../../../lib/types/deposit';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { match } from '../../../../lib/utils/match';
import { Chain } from '../../../../model/chain';
import { ChainAction } from '../../ChainAction';

interface MemoParams {
  selectedChainAction: ChainAction;
  depositFormData: FieldValues;
  bondableAsset: MayaChainPool['asset'];
  fee?: number | bigint;
}

export const generateMemo = ({
  selectedChainAction,
  depositFormData,
  bondableAsset,
}: MemoParams): string => {
  const {
    nodeAddress,
    amount,
    lpUnits,
    customMemo,
    percentage,
    provider,
    operatorFee,
    affiliateFee,
  } = extractFormValues(depositFormData);

  return match(selectedChainAction, {
    stake: () => 'd',
    unstake: () => 'w',
    withdrawPool: () =>
      `POOL-:${Math.round(shouldBePresent(percentage, 'Percentage')) * 100}:${nativeSwapAffiliateConfig.affiliateFeeAddress}:${affiliateFee || nativeSwapAffiliateConfig.affiliateFeeRateBps}`,
    addPool: () => 'POOL+',
    bond_with_lp: () => {
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`;
      }
      return `BOND:${bondableAsset}:${lpUnits}:${nodeAddress}`;
    },
    bond: () => {
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`;
      }
      // If no provider, include only operatorFee (no 'amount' field)
      return operatorFee
        ? `BOND:${nodeAddress}:${operatorFee}`
        : `BOND:${nodeAddress}`;
    },
    unbond_with_lp: () => `UNBOND:${bondableAsset}:${lpUnits}:${nodeAddress}`,
    unbond: () => {
      const runeDecimals = chainFeeCoin[Chain.THORChain].decimals;
      const amountInUnits = amount
        ? Math.round(amount * Math.pow(10, runeDecimals))
        : 0;
      return provider
        ? `UNBOND:${nodeAddress}:${amountInUnits}:${provider}`
        : `UNBOND:${nodeAddress}:${amountInUnits}`;
    },
    custom: () => shouldBePresent(customMemo, 'Custom memo'),
    leave: () => 'LEAVE',
    vote: () => 'VOTE',
  });
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
