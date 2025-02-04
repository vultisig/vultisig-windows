import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DeleteAddressBookItem } from '../../../wailsjs/go/storage/Store';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useDeleteAddressBookItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await DeleteAddressBookItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      });
    },
  });
};
