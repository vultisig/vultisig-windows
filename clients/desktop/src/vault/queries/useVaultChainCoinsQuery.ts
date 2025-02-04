import { withoutUndefined } from '@lib/utils/array/withoutUndefined';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo';
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';
import { useMemo } from 'react';

import { EntityWithPrice } from '../../chain/EntityWithPrice';
import {
  areEqualCoins,
  CoinAmount,
  CoinKey,
  coinKeyToString,
} from '../../coin/Coin';
import { useBalancesQuery } from '../../coin/query/useBalancesQuery';
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../coin/utils/storageCoin';
import {
  getResolvedQuery,
  pendingQuery,
  Query,
} from '../../lib/ui/query/Query';
import { Chain } from '../../model/chain';
import { useCurrentVaultChainCoins } from '../state/currentVault';

export type VaultChainCoin = CoinKey &
  CoinAmount &
  EntityWithLogo &
  EntityWithTicker &
  Partial<EntityWithPrice>;

export const useVaultChainCoinsQuery = (chain: Chain) => {
  const coins = useCurrentVaultChainCoins(chain);

  const pricesQuery = useCoinPricesQuery({
    coins: coins.map(coin => ({
      ...getStorageCoinKey(coin),
      priceProviderId: coin.price_provider_id,
    })),
  });

  const balancesQuery = useBalancesQuery(coins.map(storageCoinToCoin));

  return useMemo((): Query<VaultChainCoin[]> => {
    if (pricesQuery.isPending || balancesQuery.isPending) {
      return pendingQuery;
    }

    if (pricesQuery.data && balancesQuery.data) {
      const data = withoutUndefined(
        coins.map(coin => {
          const coinKey = getStorageCoinKey(coin);

          const balance = shouldBePresent(balancesQuery.data).find(balance =>
            areEqualCoins(balance, coinKey)
          );
          const amount = balance?.amount || BigInt(0);

          const price = shouldBePresent(pricesQuery.data)[
            coinKeyToString(coinKey)
          ];

          return {
            ...coinKey,
            ticker: coin.ticker,
            decimals: coin.decimals,
            logo: coin.logo,
            amount,
            price,
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
  }, [balancesQuery, coins, pricesQuery]);
};
