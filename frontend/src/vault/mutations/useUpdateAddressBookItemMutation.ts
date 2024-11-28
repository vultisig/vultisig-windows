import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AddressBookItem } from '../../lib/types/address-book';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { AddressServiceFactory } from '../../services/Address/AddressServiceFactory';
import { VaultService } from '../../services/Vault/VaultService';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useUpdateAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();
  const vaultService = new VaultService();

  return useMutation({
    mutationFn: async ({
      addressBookItem,
      chain,
    }: {
      addressBookItem: AddressBookItem;
      chain: Chain;
    }) => {
      const addressService = AddressServiceFactory.createAddressService(
        chain,
        walletCore
      );

      const isValidAddress = await addressService.validateAddress(
        addressBookItem.address
      );

      if (!isValidAddress) {
        throw new Error('vault_settings_address_book_invalid_address_error');
      }

      return await vaultService.updateAddressBookItem(addressBookItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [addressBookItemsQueryKey],
        refetchType: 'all',
      });

      onSuccess?.();
    },
  });
};
