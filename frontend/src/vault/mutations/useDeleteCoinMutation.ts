import { useMutation } from '@tanstack/react-query';
import {
  useAssertCurrentVault,
  useAssertCurrentVaultAddreses,
} from '../state/useCurrentVault';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { useAssertWalletCore } from '../../main';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { Chain } from '../../model/chain';
import { getStorageVaultId } from '../utils/storageVault';
import { accountCoinKeyToString } from '../../coin/AccountCoin';
import { CoinKey } from '../../coin/Coin';

export const useDeleteCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const invalidate = useInvalidateQueries();

  const walletCore = useAssertWalletCore();

  const addresses = useAssertCurrentVaultAddreses();

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const coinService = CoinServiceFactory.createCoinService(
        key.chainId as Chain,
        walletCore
      );

      const address = addresses[key.chainId as Chain];

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
