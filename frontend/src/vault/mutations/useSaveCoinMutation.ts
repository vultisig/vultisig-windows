import { useMutation } from '@tanstack/react-query';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { CoinMeta } from '../../model/coin-meta';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { useAssertWalletCore } from '../../main';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';

export const useSaveCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const walletCore = useAssertWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    onError: error => {
      console.log('save coin error: ', error);
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
        console.log('save coin error: ', error);
      }
    },
  });
};