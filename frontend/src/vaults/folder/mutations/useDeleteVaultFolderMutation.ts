import { useMutation } from '@tanstack/react-query';

import { DeleteVaultFolder } from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultsQueryKey } from '../../../vault/queries/useVaultsQuery';
import { vaultFoldersQueryKey } from '../../folders/queries/useVaultFoldersQuery';

export const useDeleteVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: DeleteVaultFolder,
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey, vaultsQueryKey);
    },
  });
};
