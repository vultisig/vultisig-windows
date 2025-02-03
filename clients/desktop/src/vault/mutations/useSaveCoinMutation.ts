import { useMutation } from '@tanstack/react-query';

import { SaveCoin } from '../../../wailsjs/go/storage/Store';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { createCoin } from '../../coin/utils/createCoin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { CoinMeta } from '../../model/coin-meta';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { useCurrentVault } from '../state/currentVault';
import { getStorageVaultId } from '../utils/storageVault';

export const useSaveCoinMutation = () => {
  const vault = useCurrentVault();

  const walletCore = useAssertWalletCore();

  const invalidate = useInvalidateQueries();

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error);
    },
    mutationFn: async (coinMeta: CoinMeta) => {
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

      const storageCoin = coinToStorageCoin(coin);
      await SaveCoin(getStorageVaultId(vault), storageCoin);

      await invalidate(vaultsQueryKey);
    },
  });
};
