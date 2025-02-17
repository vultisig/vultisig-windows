import { fromChainAmount } from '@core/chain/amount/fromChainAmount';
import { areEqualCoins, coinKeyToString } from '@core/chain/coin/Coin';
import { sum } from '@lib/utils/array/sum';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { getRecordSize } from '@lib/utils/record/getRecordSize';
import { useCallback, useMemo } from 'react';

import { useFormatFiatAmount } from '../../../../chain/ui/hooks/useFormatFiatAmount';
import { useCoinPricesQuery } from '../../../../coin/query/useCoinPricesQuery';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { ValueProp } from '../../../../lib/ui/props';
import { MatchEagerQuery } from '../../../../lib/ui/query/components/MatchEagerQuery';
import { useTransformQueryData } from '../../../../lib/ui/query/hooks/useTransformQueryData';
import { useCurrentVaultCoins } from '../../../state/currentVault';
import { SwapFee } from '../../types/SwapFee';

export const SwapFeeFiatValue = ({ value }: ValueProp<SwapFee[]>) => {
  const vaultCoins = useCurrentVaultCoins();
  const coins = useMemo(
    () =>
      value.map(key => {
        const coin = shouldBePresent(
          vaultCoins.find(coin => areEqualCoins(coin, key))
        );

        return coin;
      }),
    [value, vaultCoins]
  );

  const formatAmount = useFormatFiatAmount();

  const pricesQuery = useTransformQueryData(
    useCoinPricesQuery({ coins }),
    useCallback(
      prices => {
        if (getRecordSize(prices) !== value.length) {
          throw new Error('Failed to load prices');
        }

        const total = sum(
          value.map(({ amount, decimals, ...coinKey }) => {
            const key = coinKeyToString(coinKey);
            const price = prices[key];

            return price * fromChainAmount(amount, decimals);
          })
        );

        return formatAmount(total);
      },
      [formatAmount, value]
    )
  );

  return (
    <MatchEagerQuery
      value={pricesQuery}
      pending={() => <Spinner />}
      success={value => value}
    />
  );
};
