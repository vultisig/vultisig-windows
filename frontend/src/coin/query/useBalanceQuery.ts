import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { AccountCoinKey } from '../AccountCoin';
import { getCoinBalance } from '../balance/getCoinBalance';
import { CoinAmount } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';

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
    queryFn: async (): Promise<CoinAmount> => getCoinBalance(coin),
  });
};
