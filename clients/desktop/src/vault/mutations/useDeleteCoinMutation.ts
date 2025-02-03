import { useMutation } from '@tanstack/react-query';

import { DeleteCoin } from '../../../wailsjs/go/storage/Store';
import { accountCoinKeyToString } from '../../coin/AccountCoin';
import { CoinKey } from '../../coin/Coin';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { Chain } from '../../model/chain';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import {
  useCurrentVault,
  useCurrentVaultAddreses,
} from '../state/currentVault';
import { getStorageVaultId } from '../utils/storageVault';

export const useDeleteCoinMutation = () => {
  const vault = useCurrentVault();

  const invalidate = useInvalidateQueries();

  const addresses = useCurrentVaultAddreses();

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const address = addresses[key.chain as Chain];

      await DeleteCoin(
        getStorageVaultId(vault),
        accountCoinKeyToString({
          ...key,
          address,
        })
      );

      await invalidate(vaultsQueryKey);
    },
  });
};
