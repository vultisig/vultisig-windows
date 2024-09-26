import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SaveAddressBookItem } from '../../../wailsjs/go/storage/Store';
import { AddAddressBookItem } from '../../lib/types/address-book';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { AddressServiceFactory } from '../../services/Address/AddressServiceFactory';
import { addressBookItemsQueryKey } from '../queries/useAddressBookItemsQuery';

export const useAddAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();

  return useMutation({
    mutationFn: async ({
      addressBookItem,
      chain,
    }: {
      addressBookItem: AddAddressBookItem;
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
        throw new Error('Invalid address for the selected chain!');
      }

      return await SaveAddressBookItem(addressBookItem);
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
