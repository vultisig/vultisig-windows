import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { extractErrorMsg } from '../../../../lib/utils/error/extractErrorMsg';
import { useCurrentVaultCoin } from '../../../state/currentVault';
import { useFromAmount } from '../../state/fromAmount';
import { useFromCoin } from '../../state/fromCoin';

export const useIsSwapFormDisabled = () => {
  const [amount] = useFromAmount();

  const [coinKey] = useFromCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const { t } = useTranslation();

  return useMemo(() => {
    if (!amount) {
      return t('amount_required');
    }

    if (balanceQuery.isPending) {
      return t('loading');
    }

    if (!balanceQuery.data) {
      return extractErrorMsg(balanceQuery.error);
    }

    const { amount: maxChainAmount, decimals } = balanceQuery.data;
    const maxAmount = fromChainAmount(maxChainAmount, decimals);

    if (amount > maxAmount) {
      return t('insufficient_balance');
    }
  }, [
    amount,
    balanceQuery.data,
    balanceQuery.error,
    balanceQuery.isPending,
    t,
  ]);
};
