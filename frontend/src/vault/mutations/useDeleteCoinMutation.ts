import { useMutation } from '@tanstack/react-query';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { getVaultId } from '../utils/getVaultId';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { useAssertWalletCore } from '../../main';
import { CoinKey, coinKeyToString } from '../../coin/Coin';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { Chain } from '../../model/chain';

export const useDeleteCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const invalidate = useInvalidateQueries();

  const walletCore = useAssertWalletCore();

  return useMutation({
    mutationFn: async (key: CoinKey) => {
      const coinService = CoinServiceFactory.createCoinService(
        key.chainId as Chain,
        walletCore
      );

      await coinService.deleteCoin(getVaultId(vault), coinKeyToString(key));

      await invalidate(vaultsQueryKey);
    },
  });
};
