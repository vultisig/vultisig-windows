import { useMemo } from 'react';

import { Query } from '../../lib/ui/query/Query';
import { PriceProviderIdField } from '../Coin';
import { CoinKey, coinKeyToString } from '../Coin';
import { FiatCurrency } from '../price/FiatCurrency';
import { useCoinPricesQuery } from './useCoinPricesQuery';

type UseCoinPricesQueryInput = {
  coin: CoinKey & PriceProviderIdField;
  fiatCurrency?: FiatCurrency;
};

export const useCoinPriceQuery = ({
  coin,
  fiatCurrency,
}: UseCoinPricesQueryInput): Query<number> => {
  const pricesQuery = useCoinPricesQuery({
    coins: [coin],
    fiatCurrency,
  });

  return useMemo(() => {
    const data = pricesQuery.data?.[coinKeyToString(coin)];

    return {
      data,
      isPending: pricesQuery.isPending,
      isLoading: pricesQuery.isLoading,
      error: pricesQuery.errors[0] ?? null,
    };
  }, [pricesQuery, coin]);
};
