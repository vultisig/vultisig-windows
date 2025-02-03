import { useCallback } from 'react';

import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useTransform } from '../../../lib/ui/hooks/useTransform';
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery';
import { useSendAmount } from '../state/amount';
import { useCurrentSendCoin } from '../state/sendCoin';
import { capSendAmountToMax } from '../utils/capSendAmountToMax';

export const useSendCappedAmountQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useTransform(useCurrentVaultCoin(coinKey), storageCoinToCoin);
  const [amount] = useSendAmount();

  const chainSpecificQuery = useSendChainSpecificQuery();
  const balanceQuery = useBalanceQuery(coin);

  return useTransformQueriesData(
    {
      chainSpecific: chainSpecificQuery,
      balance: balanceQuery,
    },
    useCallback(
      ({ chainSpecific, balance }) => {
        const { decimals } = coin;

        const chainAmount = toChainAmount(shouldBePresent(amount), decimals);

        const feeAmount = getFeeAmount(chainSpecific);

        return {
          decimals,
          amount: capSendAmountToMax({
            amount: chainAmount,
            coin,
            fee: feeAmount,
            balance: balance.amount,
          }),
        };
      },
      [coin, amount]
    )
  );
};
