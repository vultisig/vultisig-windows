import { useQuery } from '@tanstack/react-query'

import { storage } from '../../../wailsjs/go/models'
import { GetAllAddressBookItems } from '../../../wailsjs/go/storage/Store'
import { AddressBookItem } from '../../lib/types/address-book'

const transformAddressBookItemsResponse = (
  addressBookItems: storage.AddressBookItem[]
): AddressBookItem[] =>
  addressBookItems.map((addressBookItem: any) => ({
    id: addressBookItem.ID,
    title: addressBookItem.Title,
    address: addressBookItem.Address,
    chain: addressBookItem.Chain,
    order: addressBookItem.Order,
  }))

export const addressBookItemsQueryKey = 'addressBookItems'
export const useAddressBookItemsQuery = () => {
  return useQuery({
    queryKey: [addressBookItemsQueryKey],
    queryFn: async () => {
      const addressBookItems = await GetAllAddressBookItems()
      if (!addressBookItems) {
        return []
      }

      return transformAddressBookItemsResponse(addressBookItems)
    },
    initialData: [],
    staleTime: Number.MAX_SAFE_INTEGER,
  })
}
