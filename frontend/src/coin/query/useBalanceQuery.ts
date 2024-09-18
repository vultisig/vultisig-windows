import { useQuery } from '@tanstack/react-query';

import { ChainAccount } from '../../chain/ChainAccount';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { useWalletCore } from '../../providers/WalletCoreProvider';
import { BalanceServiceFactory } from '../../services/Balance/BalanceServiceFactory';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { useCurrentVault } from '../../vault/state/useCurrentVault';
import { CoinAmount, CoinKey } from '../Coin';
import { getCoinMetaKey } from '../utils/coinMeta';

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

  const walletCore = useWalletCore();
  if (!walletCore) {
    throw new Error('WalletCore not found');
  }

  const vault = useCurrentVault();
  if (!vault) {
    throw new Error('Vault not found');
  }

  return useQuery({
    queryKey: getBalanceQueryKey({
      ...key,
      address: coin.address,
    }),
    queryFn: async (): Promise<BalanceQueryResult> => {
      const balanceService = BalanceServiceFactory.createBalanceService(chain);
      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore
      );
      await coinService.saveTokens(coin, vault);

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
