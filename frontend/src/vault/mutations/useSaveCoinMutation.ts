import { useMutation } from '@tanstack/react-query';

import { createCoin } from '../../coin/utils/createCoin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { CoinMeta } from '../../model/coin-meta';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { CoinService } from '../../services/Coin/CoinService';
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
      const coinService = new CoinService(coinMeta.chain, walletCore);

      const publicKey = await getVaultPublicKey({
        vault,
        chain: coinMeta.chain,
        walletCore,
      });

      const coin = createCoin({
        coinMeta,
        publicKey,
        walletCore,
      });

      await coinService.saveCoin(coin, vault);

      await invalidate(vaultsQueryKey);
    },
  });
};
