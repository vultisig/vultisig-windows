import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AddAddressBookItem } from '../../lib/types/address-book';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { AddressServiceFactory } from '../../services/Address/AddressServiceFactory';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import {
  addressBookItemsQueryKey,
  useAddressBookItemsQuery,
} from '../queries/useAddressBookItemsQuery';

export const useAddAddressBookItemMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) => {
  const queryClient = useQueryClient();
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);
  const { data: addressBookItems } = useAddressBookItemsQuery();

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

      const isAddressAlreadyAdded = addressBookItems.some(
        item => item.address === addressBookItem.address
      );

      if (isAddressAlreadyAdded) {
        throw new Error('Address already added!');
      }

      return await vaultService.saveAddressBookItem(addressBookItem);
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
