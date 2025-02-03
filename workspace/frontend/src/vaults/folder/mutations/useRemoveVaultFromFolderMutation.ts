import { useMutation } from '@tanstack/react-query';

import {
  UpdateVaultFolderID,
  UpdateVaultOrder,
} from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { isEmpty } from '@lib/utils/array/isEmpty';
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder';
import {
  useVaults,
  vaultsQueryKey,
} from '../../../vault/queries/useVaultsQuery';

type RemoveVaultFromFolderInput = {
  vaultId: string;
};

export const useRemoveVaultFromFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  const vaults = useVaults();

  return useMutation({
    mutationFn: async ({ vaultId }: RemoveVaultFromFolderInput) => {
      const folderlessVaults = vaults.filter(vault => !vault.folder_id);

      await UpdateVaultFolderID(vaultId, null);

      if (!isEmpty(folderlessVaults)) {
        const order = getLastItemOrder(
          folderlessVaults.map(({ order }) => order)
        );

        await UpdateVaultOrder(vaultId, order);
      }
    },
    onSuccess: () => {
      invalidateQueries(vaultsQueryKey);
    },
  });
};
