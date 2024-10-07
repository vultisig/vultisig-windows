import { useMemo } from 'react';

import { EntityWithPrice } from '../../chain/EntityWithPrice';
import { areEqualCoins, CoinAmount, CoinInfo, CoinKey } from '../../coin/Coin';
import { useBalancesQuery } from '../../coin/query/useBalancesQuery';
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery';
import { getCoinMetaIconSrc } from '../../coin/utils/coinMeta';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../coin/utils/storageCoin';
import {
  getResolvedQuery,
  pendingQuery,
  Query,
} from '../../lib/ui/query/Query';
import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { useAssertCurrentVaultChainCoins } from '../state/useCurrentVault';

export type VaultChainCoin = CoinKey &
  CoinAmount &
  CoinInfo &
  Partial<EntityWithPrice>;

export const useVaultChainCoinsQuery = (chain: Chain) => {
  const coins = useAssertCurrentVaultChainCoins(chain);

  const pricesQuery = useCoinPricesQuery(
    coins.map(storageCoinToCoin).map(CoinMeta.fromCoin)
  );

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
          const amount = balance?.amount || 0;

          const price =
            shouldBePresent(pricesQuery.data).find(item =>
              areEqualCoins(item, coinKey)
            )?.price ?? 0;

          return {
            ...coinKey,
            symbol: coin.ticker,
            decimals: coin.decimals,
            icon: getCoinMetaIconSrc(coin),
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
