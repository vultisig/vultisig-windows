import { useQuery } from '@tanstack/react-query';

import { AddressBookItem } from '../../lib/types/address-book';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';

const transformAddressBookItemsResponse = (
  // TODO: @antonio replace with "storage.AddressBookItem" type when existing
  addressBookItems: any
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
      const addressBookItems =
        (await vaultService.getAllAddressBookItems()) as AddressBookItem[];

      if (!addressBookItems) {
        return [];
      }

      return transformAddressBookItemsResponse(addressBookItems);
    },
    initialData: [],
    staleTime: Infinity,
  });
};
