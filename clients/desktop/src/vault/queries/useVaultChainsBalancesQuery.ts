import { order } from '@lib/utils/array/order';
import { sum } from '@lib/utils/array/sum';
import { recordMap } from '@lib/utils/record/recordMap';
import { toEntries } from '@lib/utils/record/toEntries';
import { useMemo } from 'react';

import { coinKeyToString } from '../../coin/Coin';
import { useBalancesQuery } from '../../coin/query/useBalancesQuery';
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery';
import { getCoinValue } from '../../coin/utils/getCoinValue';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { EagerQuery } from '../../lib/ui/query/Query';
import { Chain } from '../../model/chain';
import {
  useCurrentVaultCoins,
  useCurrentVaultCoinsByChain,
} from '../state/currentVault';
import { VaultChainCoin } from './useVaultChainCoinsQuery';

export type VaultChainBalance = {
  chain: Chain;
  coins: VaultChainCoin[];
};

export const useVaultChainsBalancesQuery = (): EagerQuery<
  VaultChainBalance[]
> => {
  const coins = useCurrentVaultCoins();
  const groupedCoins = useCurrentVaultCoinsByChain();

  const pricesQuery = useCoinPricesQuery({
    coins: coins.map(coin => ({
      ...getStorageCoinKey(coin),
      priceProviderId: coin.price_provider_id,
    })),
  });

  const balancesQuery = useBalancesQuery(coins.map(getStorageCoinKey));

  return useMemo(() => {
    const isPending = pricesQuery.isPending || balancesQuery.isPending;

    const balancesByChain = recordMap(groupedCoins, coins => {
      return coins.map(coin => {
        const coinKey = getStorageCoinKey(coin);

        const getAmount = () => {
          if (balancesQuery.data) {
            const key = coinKeyToString(coinKey);
            if (key) {
              return balancesQuery.data[key];
            }
          }

          return BigInt(0);
        };

        const price = pricesQuery.data
          ? pricesQuery.data[coinKeyToString(coinKey)]
          : 0;

        return {
          ...coinKey,
          ticker: coin.ticker,
          decimals: coin.decimals,
          logo: coin.logo,
          amount: getAmount(),
          price,
        };
      });
    });

    const data = order(
      toEntries(balancesByChain).map(({ key, value }) => ({
        chain: key,
        coins: value,
      })),
      ({ coins }) => sum(coins.map(getCoinValue)),
      'desc'
    );

    return {
      isPending,
      data,
      errors: [...balancesQuery.errors, ...pricesQuery.errors],
    };
  }, [groupedCoins, pricesQuery, balancesQuery]);
};
