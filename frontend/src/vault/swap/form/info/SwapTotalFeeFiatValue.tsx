import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormatFiatAmount } from '../../../../chain/ui/hooks/useFormatFiatAmount';
import { areEqualCoins, CoinKey } from '../../../../coin/Coin';
import { useCoinPricesQuery } from '../../../../coin/query/useCoinPricesQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../../coin/utils/storageCoin';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { MatchEagerQuery } from '../../../../lib/ui/query/components/MatchEagerQuery';
import { useTransformQueryData } from '../../../../lib/ui/query/hooks/useTransformQueryData';
import { sum } from '../../../../lib/utils/array/sum';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { EntityWithAmount } from '../../../../lib/utils/entities/EntityWithAmount';
import { CoinMeta } from '../../../../model/coin-meta';
import { useCurrentVaultCoins } from '../../../state/currentVault';

type SwapFee = CoinKey & EntityWithAmount;

export const SwapTotalFeeFiatValue = ({
  value,
}: ComponentWithValueProps<SwapFee[]>) => {
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

  const { t } = useTranslation();

  const formatAmount = useFormatFiatAmount();

  const pricesQuery = useTransformQueryData(
    useCoinPricesQuery(coins),
    useCallback(
      prices => {
        if (prices.length !== value.length) {
          return t('failed_to_load');
        }

        const total = sum(
          value.map(({ amount, ...coinKey }) => {
            const { price } = shouldBePresent(
              prices.find(price => areEqualCoins(price, coinKey))
            );

            return price * amount;
          })
        );

        return formatAmount(total);
      },
      [formatAmount, t, value]
    )
  );

  return (
    <MatchEagerQuery
      value={pricesQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={value => value}
    />
  );
};
