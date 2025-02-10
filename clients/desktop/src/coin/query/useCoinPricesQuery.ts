import { EvmChain } from '@core/chain/Chain';
import { groupItems } from '@lib/utils/array/groupItems';
import { isEmpty } from '@lib/utils/array/isEmpty';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { splitBy } from '@lib/utils/array/splitBy';
import { withoutUndefined } from '@lib/utils/array/withoutUndefined';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { mergeRecords } from '@lib/utils/record/mergeRecords';
import { useQueries } from '@tanstack/react-query';

import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';
import { useFiatCurrency } from '../../preferences/state/fiatCurrency';
import { Coin, CoinKey, coinKeyToString } from '../Coin';
import { getErc20Prices } from '../price/api/evm/getErc20Prices';
import { getCoinPrices } from '../price/api/getCoinPrices';
import { FiatCurrency } from '../price/FiatCurrency';
import { isFeeCoin } from '../utils/isFeeCoin';

type GetCoinPricesQueryKeysInput = {
  coins: CoinKey[];
  fiatCurrency: FiatCurrency;
};

export const getCoinPricesQueryKeys = (input: GetCoinPricesQueryKeysInput) => [
  'coinPrices',
  input,
];

type UseCoinPricesQueryInput = {
  coins: Pick<Coin, 'id' | 'chain' | 'priceProviderId'>[];
  fiatCurrency?: FiatCurrency;
};

export const useCoinPricesQuery = (input: UseCoinPricesQueryInput) => {
  const [defaultFiatCurrency] = useFiatCurrency();

  const fiatCurrency = input.fiatCurrency ?? defaultFiatCurrency;

  const queries = [];

  const [regularCoins, erc20Coins] = splitBy(input.coins, coin =>
    isOneOf(coin.chain, Object.values(EvmChain)) && !isFeeCoin(coin) ? 1 : 0
  );

  if (!isEmpty(erc20Coins)) {
    const groupedByChain = groupItems(erc20Coins, coin => coin.chain);

    Object.entries(groupedByChain).forEach(([chain, coins]) => {
      queries.push({
        queryKey: getCoinPricesQueryKeys({
          coins,
          fiatCurrency,
        }),
        queryFn: async () => {
          const prices = await getErc20Prices({
            ids: coins.map(coin => coin.id),
            chain: chain as EvmChain,
            fiatCurrency,
          });

          const result: Record<string, number> = {};

          Object.entries(prices).forEach(([id, price]) => {
            const coin = shouldBePresent(coins.find(coin => coin.id === id));

            result[coinKeyToString(coin)] = price;
          });

          return result;
        },
      });
    });
  }

  if (!isEmpty(regularCoins)) {
    queries.push({
      queryKey: getCoinPricesQueryKeys({
        coins: regularCoins,
        fiatCurrency,
      }),
      queryFn: async () => {
        const prices = await getCoinPrices({
          ids: withoutUndefined(regularCoins.map(coin => coin.priceProviderId)),
          fiatCurrency,
        });

        const result: Record<string, number> = {};

        Object.entries(prices).forEach(([priceProviderId, price]) => {
          const coin = shouldBePresent(
            regularCoins.find(coin => coin.priceProviderId === priceProviderId)
          );

          result[coinKeyToString(coin)] = price;
        });

        return result;
      },
    });
  }

  const queryResults = useQueries({
    queries,
  });

  return useQueriesToEagerQuery({
    queries: queryResults,
    joinData: data => mergeRecords(...data),
  });
};
