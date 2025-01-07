import { useQuery } from '@tanstack/react-query';

import { ChainAccount } from '../../chain/ChainAccount';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { AccountCoinKey } from '../AccountCoin';
import { getCoinBalance } from '../balance/getCoinBalance';
import { CoinAmount, CoinKey } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';

export type BalanceQueryResult = CoinKey & CoinAmount & ChainAccount;
export const getBalanceQueryKey = (key: AccountCoinKey) => ['coinBalance', key];

export const useBalanceQuery = (coin: Coin) => {
  const chain = coin.chain as Chain;
  const key = getCoinMetaKey({
    ...coin,
    chain,
  });

  return useQuery({
    queryKey: getBalanceQueryKey({
      ...key,
      address: coin.address,
    }),
    queryFn: async (): Promise<BalanceQueryResult> => {
      const balance = await getCoinBalance(coin);

      return {
        ...balance,
        ...key,
        address: coin.address,
      };
    },
  });
};
