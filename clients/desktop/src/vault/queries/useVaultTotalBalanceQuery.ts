import { sum } from '@lib/utils/array/sum';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useMemo } from 'react';

import { areEqualCoins, coinKeyToString } from '../../coin/Coin';
import { useBalancesQuery } from '../../coin/query/useBalancesQuery';
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery';
import { getCoinValue } from '../../coin/utils/getCoinValue';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../coin/utils/storageCoin';
import {
  getResolvedQuery,
  pendingQuery,
  Query,
} from '../../lib/ui/query/Query';
import { useCurrentVaultCoins } from '../state/currentVault';

export const useVaultTotalBalanceQuery = () => {
  const coins = useCurrentVaultCoins();

  const pricesQuery = useCoinPricesQuery({
    coins: coins.map(coin => ({
      ...getStorageCoinKey(coin),
      priceProviderId: coin.price_provider_id,
    })),
  });

  const balancesQuery = useBalancesQuery(coins.map(storageCoinToCoin));

  return useMemo((): Query<number> => {
    if (pricesQuery.isPending || balancesQuery.isPending) {
      return pendingQuery;
    }

    if (pricesQuery.data && balancesQuery.data) {
      const data = sum(
        coins.map(coin => {
          const key = getStorageCoinKey(coin);
          const price = shouldBePresent(pricesQuery.data)[coinKeyToString(key)];
          const balance = shouldBePresent(balancesQuery.data).find(item =>
            areEqualCoins(item, key)
          );

          if (price === undefined || balance === undefined) {
            return 0;
          }

          return getCoinValue({
            amount: balance.amount,
            decimals: coin.decimals,
            price: price,
          });
        })
      );

      return getResolvedQuery(data);
    }

    return {
      isPending: false,
      data: undefined,
      error: [...balancesQuery.errors, ...pricesQuery.errors][0],
    };
  }, [balancesQuery, coins, pricesQuery]);
};
