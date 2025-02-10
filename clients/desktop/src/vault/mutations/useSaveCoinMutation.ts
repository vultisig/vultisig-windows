import { useMutation } from '@tanstack/react-query';

import { SaveCoin } from '../../../wailsjs/go/storage/Store';
import { Coin } from '../../coin/Coin';
import { coinToStorageCoin } from '../../coin/utils/coin';
import { createCoin } from '../../coin/utils/createCoin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
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
    mutationFn: async (coin: Coin) => {
      const publicKey = await getVaultPublicKey({
        vault,
        chain: coin.chain,
        walletCore,
      });

      const communicationCoin = createCoin({
        coin,
        publicKey,
        walletCore,
      });

      const storageCoin = coinToStorageCoin(communicationCoin);
      await SaveCoin(getStorageVaultId(vault), storageCoin);

      await invalidate(vaultsQueryKey);
    },
  });
};
