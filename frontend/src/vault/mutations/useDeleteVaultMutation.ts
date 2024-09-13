import { useMutation } from '@tanstack/react-query';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { DeleteVault } from '../../../wailsjs/go/storage/Store';

export const useDeleteVaultMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: async (publicKeyEcdsa: string) => {
      await DeleteVault(publicKeyEcdsa);
      await invalidateQueries();
    },
  });
};
