import { useQuery } from '@tanstack/react-query';

import { GetAllAddressBookItems } from '../../../wailsjs/go/storage/Store';
import { AddressBookItem } from '../../lib/types/address-book';

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
  return useQuery({
    queryKey: [addressBookItemsQueryKey],
    queryFn: async () => {
      const addressBookItems =
        (await GetAllAddressBookItems()) as AddressBookItem[];

      if (!addressBookItems) {
        return [];
      }

      return transformAddressBookItemsResponse(addressBookItems);
    },
    initialData: [],
  });
};
