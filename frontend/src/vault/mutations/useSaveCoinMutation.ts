import { useMutation } from '@tanstack/react-query';

import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { CoinMeta } from '../../model/coin-meta';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { useAssertCurrentVault } from '../state/useCurrentVault';

export const useSaveCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const walletCore = useAssertWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error);
    },
    mutationFn: async (coinMeta: CoinMeta) => {
      try {
        const coinService = CoinServiceFactory.createCoinService(
          coinMeta.chain,
          walletCore
        );

        const coin = await coinService.createCoin(
          coinMeta,
          vault.public_key_ecdsa || '',
          vault.public_key_eddsa || '',
          vault.hex_chain_code || ''
        );

        await coinService.saveCoin(coin, vault);

        await invalidate(vaultsQueryKey);
      } catch (error) {
        console.error('save coin error: ', error);
      }
    },
  });
};
