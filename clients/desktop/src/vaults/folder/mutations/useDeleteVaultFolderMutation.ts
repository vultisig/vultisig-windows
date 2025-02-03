import { useMutation } from '@tanstack/react-query';

import {
  DeleteVaultFolder,
  UpdateVaultOrder,
} from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { isEmpty } from '@lib/utils/array/isEmpty';
import { Entry } from '@lib/utils/entities/Entry';
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder';
import {
  useVaults,
  vaultsQueryKey,
} from '../../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { vaultFoldersQueryKey } from '../../folders/queries/useVaultFoldersQuery';

export const useDeleteVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  const vaults = useVaults();

  return useMutation({
    mutationFn: async (folderId: string) => {
      const folderVaults = vaults.filter(vault => vault.folder_id === folderId);
      const folderlessVaults = vaults.filter(vault => !vault.folder_id);

      await DeleteVaultFolder(folderId);

      if (!isEmpty(folderVaults)) {
        const entries: Entry<string, number>[] = [];
        folderVaults.forEach(vault => {
          const orders = [
            ...entries.map(entry => entry.value),
            ...folderlessVaults.map(vault => vault.order),
          ];

          const order = getLastItemOrder(orders);

          entries.push({ key: getStorageVaultId(vault), value: order });
        });

        await Promise.all(
          entries.map(({ key, value }) => UpdateVaultOrder(key, value))
        );
      }
    },
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey, vaultsQueryKey);
    },
  });
};
