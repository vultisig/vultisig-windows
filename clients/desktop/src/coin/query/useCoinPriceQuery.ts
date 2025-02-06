import { pick } from '@lib/utils/record/pick';
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
  const query = useCoinPricesQuery({
    coins: [coin],
    fiatCurrency,
  });

  return useMemo(() => {
    const error = query.errors[0] ?? null;

    const data = query.data?.[coinKeyToString(coin)];

    return {
      data,
      ...pick(query, ['isPending', 'isLoading']),
      error,
    };
  }, [query, coin]);
};
