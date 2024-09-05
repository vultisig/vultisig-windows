import { useMemo } from 'react';
import { ChainAccount } from '../../chain/ChainAccount';
import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';
import { areEqualCoins, CoinAmount, CoinKey } from '../Coin';
import { useBalancesQuery } from './useBalancesQuery';
import { useCoinPricesQuery } from './useCoinPricesQuery';
import {
  getResolvedQuery,
  pendingQuery,
  Query,
} from '../../lib/ui/query/Query';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';

type OwnedCoin = CoinKey & CoinAmount & ChainAccount & Partial<EntityWithPrice>;

export const useOwnedCoinsQuery = (coins: Coin[]) => {
  const pricesQuery = useCoinPricesQuery(
    coins.map(coin => CoinMeta.fromCoin(coin))
  );

  const balancesQuery = useBalancesQuery(coins);

  return useMemo((): Query<OwnedCoin[]> => {
    if (pricesQuery.isPending || balancesQuery.isPending) {
      return pendingQuery;
    }

    if (pricesQuery.data && balancesQuery.data) {
      const data = withoutUndefined(
        shouldBePresent(balancesQuery.data).map(balance => {
          if (!balance.amount) {
            return;
          }

          const price = shouldBePresent(pricesQuery.data).find(item =>
            areEqualCoins(item, balance)
          );

          return {
            ...balance,
            price: price?.price,
          };
        })
      );

      return getResolvedQuery(data);
    }

    return {
      isPending: false,
      data: undefined,
      error: [...balancesQuery.errors, ...pricesQuery.errors][0],
    };
  }, [balancesQuery, pricesQuery]);
};
