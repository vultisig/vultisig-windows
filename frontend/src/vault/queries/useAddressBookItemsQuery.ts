import { useQuery } from '@tanstack/react-query';

import { GetAddressBookItems } from '../../../wailsjs/go/storage/Store';
import { AddressBookItem } from '../../lib/types/address-book';
import { useCurrentVault } from '../state/useCurrentVault';

export const addressBookItemsQueryKey = ['addressBookItems'];

export const useAddressBookItemsQuery = (vaultPublicKeyEcdsa?: string) => {
  const currentVault = useCurrentVault();

  return useQuery({
    queryKey: [addressBookItemsQueryKey],
    queryFn: async () => {
      const public_key_ecdsa =
        vaultPublicKeyEcdsa || currentVault?.public_key_ecdsa;

      if (!public_key_ecdsa) {
        return [];
      }

      const addressBookItems = (await GetAddressBookItems(
        public_key_ecdsa
      )) as AddressBookItem[];

      if (!addressBookItems) {
        return [];
      }

      return addressBookItems;
    },
    initialData: [],
  });
};
