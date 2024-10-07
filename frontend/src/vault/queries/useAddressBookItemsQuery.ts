import { useQuery } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { AddressBookItem } from '../../lib/types/address-book';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';

const transformAddressBookItemsResponse = (
  addressBookItems: storage.AddressBookItem[]
): AddressBookItem[] =>
  addressBookItems.map((addressBookItem: any) => ({
    id: addressBookItem.ID,
    title: addressBookItem.Title,
    address: addressBookItem.Address,
    chain: addressBookItem.Chain,
    order: addressBookItem.Order,
  }));

export const addressBookItemsQueryKey = ['addressBookItems'];

export const useAddressBookItemsQuery = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

  return useQuery({
    queryKey: [addressBookItemsQueryKey],
    queryFn: async () => {
      const addressBookItems = await vaultService.getAllAddressBookItems();

      if (!addressBookItems) {
        return [];
      }

      return transformAddressBookItemsResponse(addressBookItems);
    },
    initialData: [],
    staleTime: 1000,
  });
};
