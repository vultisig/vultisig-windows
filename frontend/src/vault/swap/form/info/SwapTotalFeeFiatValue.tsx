import { useEffect, useMemo } from 'react';
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
  const [, setFees] = useSwapFees();
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

  const { data: prices, isPending, errors } = useCoinPricesQuery(coins);

  const feesResult = useMemo(() => {
    if (!prices || prices.length !== value.length) {
      return null;
    }

    const fees = sum(
      value.map(({ amount, ...coinKey }) => {
        const { price } = shouldBePresent(
          prices.find(price => areEqualCoins(price, coinKey))
        );

        return price * amount;
      })
    );

    return {
      fees,
      feesFormatted: formatAmount(fees),
    };
  }, [prices, value, formatAmount]);

  useEffect(() => {
    if (feesResult) {
      setFees({ type: 'swap', totalFeesFormatted: feesResult.feesFormatted });
    }
  }, [feesResult, setFees]);

  if (isPending) {
    return <Spinner />;
  }

  if (errors.length > 0) {
    return <>{t('failed_to_load')}</>;
  }

  return <>{feesResult?.fees || null}</>;
};
