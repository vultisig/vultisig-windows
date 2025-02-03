import { useQueries } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';
import { Chain } from '../../model/chain';
import { getCoinBalance } from '../balance/getCoinBalance';
import { CoinAmount, CoinKey } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';
import { getBalanceQueryKey } from './useBalanceQuery';

export const useBalancesQuery = (coins: Coin[]) => {
  const queries = useQueries({
    queries: coins.map(coin => {
      const chain = coin.chain as Chain;
      const key = getCoinMetaKey({
        ...coin,
        chain,
      });

      return {
        queryKey: getBalanceQueryKey({
          ...key,
          address: coin.address,
        }),
        queryFn: async (): Promise<CoinAmount & CoinKey> => {
          const balance = await getCoinBalance(coin);

          return {
            ...balance,
            ...key,
          };
        },
      };
    }),
  });

  return useQueriesToEagerQuery({
    queries,
    joinData: data => data,
  });
};
