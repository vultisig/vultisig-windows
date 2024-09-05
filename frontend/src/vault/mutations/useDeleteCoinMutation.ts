import { useMutation } from '@tanstack/react-query';
import { DeleteCoin } from '../../../wailsjs/go/storage/Store';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { getVaultId } from '../utils/getVaultId';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../queries/useVaultsQuery';

export const useDeleteCoinMutation = () => {
  const vault = useAssertCurrentVault();

  const invalidate = useInvalidateQueries();

  return useMutation({
    mutationFn: async (coinId: string) => {
      DeleteCoin(getVaultId(vault), coinId);

      await invalidate(vaultsQueryKey);
    },
  });
};
