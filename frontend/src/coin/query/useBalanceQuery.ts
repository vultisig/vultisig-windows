import { useQuery } from '@tanstack/react-query';

import { ChainAccount } from '../../chain/ChainAccount';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { BalanceServiceFactory } from '../../services/Balance/BalanceServiceFactory';
import { AccountCoinKey } from '../AccountCoin';
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
      const balanceService = BalanceServiceFactory.createBalanceService(chain);

      const { rawAmount } = await balanceService.getBalance(coin);

      return {
        amount: BigInt(Math.round(rawAmount)),
        decimals: coin.decimals,

        ...key,

        address: coin.address,
      };
    },
  });
};
