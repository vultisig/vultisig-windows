import { useMutation, useQueryClient } from '@tanstack/react-query';

import { VaultService } from '../../services/Vault/VaultService';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useDeleteAddressBookItemMutation = () => {
  const queryClient = useQueryClient();
  const vaultService = new VaultService();

  return useMutation({
    mutationFn: async (id: string) => {
      await vaultService.deleteAddressBookItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      });
    },
  });
};
