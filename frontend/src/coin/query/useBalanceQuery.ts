import { useQuery } from '@tanstack/react-query';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { getCoinMetaKey } from '../utils/coinMeta';
import { Chain } from '../../model/chain';
import { BalanceServiceFactory } from '../../services/Balance/BalanceServiceFactory';
import { CoinAmount, CoinKey } from '../Coin';
import { ChainAccount } from '../../chain/ChainAccount';

export type BalanceQueryResult = CoinKey & CoinAmount & ChainAccount;

export const getBalanceQueryKey = ({
  address,
  ...key
}: CoinKey & ChainAccount) => ['coinBalance', key, address];

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
        amount: rawAmount,
        decimals: coin.decimals,

        ...key,

        address: coin.address,
      };
    },
  });
};
