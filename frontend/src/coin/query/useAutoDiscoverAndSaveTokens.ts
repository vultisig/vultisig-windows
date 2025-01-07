import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../model/chain';
import { useWalletCore } from '../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { useCurrentVault } from '../../vault/state/currentVault';

export const useAutoDiscoverAndSaveTokens = ({
  chain,
  coin,
}: {
  chain: Chain;
  coin: Coin;
}) => {
  const walletCore = useWalletCore();

  if (!walletCore) {
    throw new Error('WalletCore not found');
  }

  const vault = useCurrentVault();
  if (!vault) {
    throw new Error('Vault not found');
  }

  return useQuery({
    queryKey: ['autoDiscoverAndSaveTokens'],
    queryFn: async () => {
      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore
      );

      return await coinService.saveTokens(coin, vault);
    },
  });
};
