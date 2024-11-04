import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../wailsjs/go/models';
import {
  SaveVaultFolder,
  UpdateVaultFolderID,
} from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultFoldersQueryKey } from '../queries/useVaultFoldersQuery';

type CreateVaultFolderInput = {
  name: string;
  order: number;
  vaultIds: string[];
};

export const useCreateVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: async ({ name, order, vaultIds }: CreateVaultFolderInput) => {
      const folder = new storage.VaultFolder();
      folder.name = name;
      folder.order = order;

      await SaveVaultFolder(folder);

      await Promise.all(
        vaultIds.map(vaultId => UpdateVaultFolderID(vaultId, folder.id))
      );
    },
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey);
    },
  });
};
