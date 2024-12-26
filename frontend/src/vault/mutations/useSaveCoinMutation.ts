import { useMutation } from '@tanstack/react-query';

import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { CoinMeta } from '../../model/coin-meta';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { useCurrentVault } from '../state/currentVault';

export const useSaveCoinMutation = () => {
  const vault = useCurrentVault();

  const walletCore = useAssertWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error);
    },
    mutationFn: async (coinMeta: CoinMeta) => {
      const coinService = CoinServiceFactory.createCoinService(
        coinMeta.chain,
        walletCore
      );

      const coin = await coinService.createCoin(
        coinMeta,
        getVaultPublicKey({
          vault,
          chain: coinMeta.chain,
        })
      );

      await coinService.saveCoin(coin, vault);

      await invalidate(vaultsQueryKey);
    },
  });
};
