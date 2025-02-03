import { useQuery } from '@tanstack/react-query';

import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { CoinKey } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';

export const getCoinPriceRecordQueryKeys = (coins: CoinKey[]) => [
  'coinPriceRecord',
  coins,
];

export const useCoinPriceRecordQuery = (coin: CoinMeta) => {
  return useQuery({
    queryKey: getCoinPriceRecordQueryKeys([getCoinMetaKey(coin)]),
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
