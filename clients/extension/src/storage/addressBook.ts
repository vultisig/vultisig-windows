import { AddressBookItem } from '@core/ui/addressBook/AddressBookItem'
import { GetAddressBookItemsFunction } from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const initialAddressBookItems: AddressBookItem[] = []

export const getAddressBookItems: GetAddressBookItemsFunction = async () => {
  return getPersistentState(
    StorageKey.addressBookItems,
    initialAddressBookItems
  )
}

export const updateAddressBookItems = async (items: AddressBookItem[]) => {
  await setPersistentState(StorageKey.addressBookItems, items)
}
