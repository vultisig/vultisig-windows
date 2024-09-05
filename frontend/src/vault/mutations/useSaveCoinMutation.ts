import { useMutation } from '@tanstack/react-query';
import { SaveCoin } from '../../../wailsjs/go/storage/Store';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { getVaultId } from '../utils/getVaultId';
import { CoinMeta } from '../../model/coin-meta';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { useAsserWalletCore } from '../../main';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';

export const useSaveCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const walletCore = useAsserWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    mutationFn: async (coinMeta: CoinMeta) => {
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

      const storageCoin = coinToStorageCoin(coin);

      await SaveCoin(getVaultId(vault), storageCoin);

      await invalidate(vaultsQueryKey);
    },
  });
};
