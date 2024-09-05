import { useQueries } from '@tanstack/react-query';
import { CoinMeta } from '../../model/coin-meta';
import { getCoinMetaKey } from '../utils/coinMeta';
import { toEntries } from '../../lib/utils/record/toEntries';
import { PriceServiceFactory } from '../../services/Price/PriceServiceFactory';
import { useAssertWalletCore } from '../../main';
import { Fiat } from '../../model/fiat';
import { CoinKey } from '../Coin';
import { groupItems } from '../../lib/utils/array/groupItems';
import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';

type PriceQueryResult = CoinKey & EntityWithPrice;

export const useCoinPricesQuery = (coins: CoinMeta[]) => {
  const walletCore = useAssertWalletCore();

  const groups = groupItems(coins, item => item.chain);

  const queries = useQueries({
    queries: toEntries(groups).map(({ key, value }) => {
      return {
        queryKey: ['coinPrices', value.map(getCoinMetaKey)],
        queryFn: async (): Promise<PriceQueryResult[]> => {
          const priceService = PriceServiceFactory.createPriceService(
            key,
            walletCore
          );
          const prices = await priceService.getPrices(value);

          const result: PriceQueryResult[] = [];

          value.forEach(coin => {
            const price = prices
              .get(CoinMeta.sortedStringify(coin))
              ?.find(rate => rate.fiat === Fiat.USD)?.value;

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
