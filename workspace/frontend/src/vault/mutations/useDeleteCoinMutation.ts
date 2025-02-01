import { useMutation } from '@tanstack/react-query';

import { accountCoinKeyToString } from '../../coin/AccountCoin';
import { CoinKey } from '../../coin/Coin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { CoinService } from '../../services/Coin/CoinService';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import {
  useCurrentVault,
  useCurrentVaultAddreses,
} from '../state/currentVault';
import { getStorageVaultId } from '../utils/storageVault';

export const useDeleteCoinMutation = () => {
  const vault = useCurrentVault();

  const invalidate = useInvalidateQueries();

  const walletCore = useAssertWalletCore();

  const addresses = useCurrentVaultAddreses();

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const coinService = new CoinService(key.chain, walletCore);

      const address = addresses[key.chain as Chain];

      await coinService.deleteCoin(
        accountCoinKeyToString({
          ...key,
          address,
        }),
        getStorageVaultId(vault)
      );

      await invalidate(vaultsQueryKey);
    },
  });
};
