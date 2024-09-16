import { Chain } from '../../model/chain';
import {
  useAssertCurrentVaultCoins,
  useAssertCurrentVaultCoinsByChain,
} from '../state/useCurrentVault';
import { VaultChainCoin } from './useVaultChainCoinsQuery';
import { useBalancesQuery } from '../../coin/query/useBalancesQuery';
import { useCoinPricesQuery } from '../../coin/query/useCoinPricesQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../coin/utils/storageCoin';
import { CoinMeta } from '../../model/coin-meta';
import { EagerQuery } from '../../lib/ui/query/Query';
import { useMemo } from 'react';
import { recordMap } from '../../lib/utils/record/recordMap';
import { areEqualCoins } from '../../coin/Coin';
import { getCoinMetaIconSrc } from '../../coin/utils/coinMeta';
import { order } from '../../lib/utils/array/order';
import { toEntries } from '../../lib/utils/record/toEntries';
import { sum } from '../../lib/utils/array/sum';
import { getCoinValue } from '../../coin/utils/getCoinValue';

export type VaultChainBalance = {
  chainId: Chain;
  coins: VaultChainCoin[];
};

export const useVaultChainsBalancesQuery = (): EagerQuery<
  VaultChainBalance[]
> => {
  const coins = useAssertCurrentVaultCoins();
  const groupedCoins = useAssertCurrentVaultCoinsByChain();

  const pricesQuery = useCoinPricesQuery(
    coins.map(storageCoinToCoin).map(CoinMeta.fromCoin)
  );

  const balancesQuery = useBalancesQuery(coins.map(storageCoinToCoin));

  return useMemo(() => {
    const isPending = pricesQuery.isPending || balancesQuery.isPending;

    const balancesByChain = recordMap(groupedCoins, coins => {
      return coins.map(coin => {
        const coinKey = getStorageCoinKey(coin);

        const balance = (balancesQuery.data ?? []).find(balance =>
          areEqualCoins(balance, coinKey)
        );
        const amount = balance?.amount || 0;

        const price =
          (pricesQuery.data ?? []).find(item => areEqualCoins(item, coinKey))
            ?.price ?? 0;

        return {
          ...coinKey,
          symbol: coin.ticker,
          decimals: coin.decimals,
          icon: getCoinMetaIconSrc(coin),
          amount,
          price,
        };
      });
    });

    const data = order(
      toEntries(balancesByChain).map(({ key, value }) => ({
        chainId: key,
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
