import { useQuery } from '@tanstack/react-query';

import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { getCoinMetaKey } from '../utils/coinMeta';
import { getCoinPricesQueryKeys } from './useCoinPricesQuery';

export const useCoinPriceRecordQuery = (coin: CoinMeta) => {
  return useQuery({
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
};
