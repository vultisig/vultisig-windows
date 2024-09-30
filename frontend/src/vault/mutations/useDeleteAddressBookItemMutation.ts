import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useDeleteAddressBookItemMutation = () => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

  return useMutation({
    mutationFn: async (id: string) => {
      await vaultService.deleteAddressBookItem(id);
    },
    onSuccess: () => {
      console.log('## on success?');
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      });
    },
  });
};
