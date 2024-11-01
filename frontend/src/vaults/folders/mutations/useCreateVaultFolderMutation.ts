import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../wailsjs/go/models';
import { SaveVaultFolder } from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultFoldersQueryKey } from '../queries/useVaultFoldersQuery';

type CreateVaultFolderInput = {
  name: string;
  order: number;
};

export const useCreateVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: async ({ name, order }: CreateVaultFolderInput) => {
      const folder = new storage.VaultFolder();
      folder.name = name;
      folder.order = order;

      return SaveVaultFolder(folder);
    },
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey);
    },
  });
};
