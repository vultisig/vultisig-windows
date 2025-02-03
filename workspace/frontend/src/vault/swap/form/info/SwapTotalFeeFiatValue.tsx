import { sum } from '@lib/utils/array/sum';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useCallback, useMemo } from 'react';

import { useFormatFiatAmount } from '../../../../chain/ui/hooks/useFormatFiatAmount';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { areEqualCoins } from '../../../../coin/Coin';
import { useCoinPricesQuery } from '../../../../coin/query/useCoinPricesQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../../coin/utils/storageCoin';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { ValueProp } from '../../../../lib/ui/props';
import { MatchEagerQuery } from '../../../../lib/ui/query/components/MatchEagerQuery';
import { useTransformQueryData } from '../../../../lib/ui/query/hooks/useTransformQueryData';
import { CoinMeta } from '../../../../model/coin-meta';
import { useCurrentVaultCoins } from '../../../state/currentVault';
import { SwapFee } from '../../types/SwapFee';

export const SwapFeeFiatValue = ({ value }: ValueProp<SwapFee[]>) => {
  const vaultCoins = useCurrentVaultCoins();
  const coins = useMemo(
    () =>
      value.map(key =>
        CoinMeta.fromCoin(
          storageCoinToCoin(
            shouldBePresent(
              vaultCoins.find(coin =>
                areEqualCoins(getStorageCoinKey(coin), key)
              )
            )
          )
        )
      ),
    [value, vaultCoins]
  );

  const formatAmount = useFormatFiatAmount();

  const pricesQuery = useTransformQueryData(
    useCoinPricesQuery(coins),
    useCallback(
      prices => {
        if (prices.length !== value.length) {
          throw new Error('Failed to load prices');
        }

        const total = sum(
          value.map(({ amount, decimals, ...coinKey }) => {
            const { price } = shouldBePresent(
              prices.find(price => areEqualCoins(price, coinKey))
            );

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
