import { useMemo } from 'react';
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
import { sum } from '../../../../lib/utils/array/sum';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { EntityWithAmount } from '../../../../lib/utils/entities/EntityWithAmount';
import { CoinMeta } from '../../../../model/coin-meta';
import { useCurrentVaultCoins } from '../../../state/currentVault';
import { useSwapFees } from '../../state/swapFees';

type SwapFee = CoinKey & EntityWithAmount;

export const SwapTotalFeeFiatValue = ({
  value,
}: ComponentWithValueProps<SwapFee[]>) => {
  const [, setSwapFees] = useSwapFees();
  const vaultCoins = useCurrentVaultCoins();
  const { t } = useTranslation();
  const formatAmount = useFormatFiatAmount();

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

  const pricesQuery = useCoinPricesQuery(coins);

  return (
    <MatchEagerQuery
      value={pricesQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={prices => {
        if (prices.length !== value.length) {
          return t('failed_to_load');
        }

        const fees = sum(
          value.map(({ amount, ...coinKey }) => {
            const { price } = shouldBePresent(
              prices.find(price => areEqualCoins(price, coinKey))
            );

            return price * amount;
          })
        );

        const feesFormatted = formatAmount(fees);
        setSwapFees({ totalFeesFormatted: feesFormatted });
        return fees;
      }}
    />
  );
};
