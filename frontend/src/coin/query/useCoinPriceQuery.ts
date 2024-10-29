import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { useTransformQueryData } from '../../lib/ui/query/hooks/useTransformQueryData';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { getCoinMetaKey } from '../utils/coinMeta';
import { getCoinPricesQueryKeys } from './useCoinPricesQuery';

export const useCoinPriceQuery = (coin: CoinMeta) => {
  const { globalCurrency } = useGlobalCurrency();

  const query = useQuery({
    queryKey: getCoinPricesQueryKeys([getCoinMetaKey(coin)]),
    queryFn: async () => {
      const priceService = PriceServiceFactory.createPriceService(coin.chain);
      const prices = await priceService.getPrices([coin]);

      const priceRecord: Partial<Record<Fiat, number>> = {};

      prices.get(CoinMeta.sortedStringify(coin))?.forEach(rate => {
        priceRecord[rate.fiat] = rate.value;
      });

      return priceRecord;
    },
  });

  return useTransformQueryData(
    query,
    useCallback(data => data[globalCurrency], [globalCurrency])
  );
};
