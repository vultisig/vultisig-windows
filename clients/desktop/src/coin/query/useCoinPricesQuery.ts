import { useQueries } from '@tanstack/react-query';

import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { useGlobalCurrency } from '../../lib/hooks/useGlobalCurrency';
import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';
import { groupItems } from '@lib/utils/array/groupItems';
import { toEntries } from '@lib/utils/record/toEntries';
import { CoinMeta } from '../../model/coin-meta';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { CoinKey } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';

type PriceQueryResult = CoinKey & EntityWithPrice;

export const getCoinPricesQueryKeys = (coins: CoinKey[]) => [
  'coinPrices',
  coins,
];

export const useCoinPricesQuery = (coins: CoinMeta[]) => {
  const groups = groupItems(coins, item => item.chain);
  const { globalCurrency } = useGlobalCurrency();

  const queries = useQueries({
    queries: toEntries(groups).map(({ key, value }) => {
      return {
        queryKey: getCoinPricesQueryKeys(value.map(getCoinMetaKey)),
        queryFn: async (): Promise<PriceQueryResult[]> => {
          const priceService = PriceServiceFactory.createPriceService(key);
          const prices = await priceService.getPrices(value);
          const result: PriceQueryResult[] = [];

          value.forEach(coin => {
            const price = prices
              .get(CoinMeta.sortedStringify(coin))
              ?.find(rate => rate.fiat === globalCurrency)?.value;

            if (price) {
              result.push({
                price,
                ...getCoinMetaKey(coin),
              });
            }
          });

          return result;
        },
      };
    }),
  });

  return useQueriesToEagerQuery({
    queries,
    joinData: data => data.flat(),
  });
};
