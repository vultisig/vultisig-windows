import { AddressBookItem } from '@core/ui/address-book/item'
import { addressBookItemsQueryKey } from '@core/ui/query/keys'
import { GetAddressBookItemsFunction } from '@core/ui/storage/CoreStorage'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = addressBookItemsQueryKey

const initialAddressBookItems: AddressBookItem[] = []

export const getAddressBookItems: GetAddressBookItemsFunction = async () => {
  return getPersistentState(key, initialAddressBookItems)
}

export const updateAddressBookItems = async (items: AddressBookItem[]) => {
  await setPersistentState(key, items)
}
