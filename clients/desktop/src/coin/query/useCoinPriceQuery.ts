import { useCallback } from 'react';

import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { useTransformQueryData } from '../../lib/ui/query/hooks/useTransformQueryData';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { useCoinPriceRecordQuery } from './useCoinPriceRecordQuery';

export const useCoinPriceQuery = (coin: CoinMeta, currency?: Fiat) => {
  const { globalCurrency } = useGlobalCurrency();

  const query = useCoinPriceRecordQuery(coin);

  return useTransformQueryData(
    query,
    useCallback(
      data => data[currency ?? globalCurrency],
      [currency, globalCurrency]
    )
  );
};
