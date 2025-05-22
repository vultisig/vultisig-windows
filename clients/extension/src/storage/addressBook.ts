import { AddressBookItem } from '@core/ui/addressBook/AddressBookItem'
import {
  AddressBookStorage,
  GetAddressBookItemsFunction,
  initialAddressBookItems,
} from '@core/ui/storage/addressBook'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const getAddressBookItems: GetAddressBookItemsFunction = async () => {
  return getPersistentState(
    StorageKey.addressBookItems,
    initialAddressBookItems
  )
}

export const updateAddressBookItems = async (items: AddressBookItem[]) => {
  await setPersistentState(StorageKey.addressBookItems, items)
}

export const addressBookStorage: AddressBookStorage = {
  updateAddressBookItem: async ({ id, fields }) => {
    const items = await getAddressBookItems()
    const itemIndex = shouldBePresent(items.findIndex(item => item.id === id))

    const updatedAddressBookItems = updateAtIndex(items, itemIndex, item => ({
      ...item,
      ...fields,
    }))

    await updateAddressBookItems(updatedAddressBookItems)
  },
  createAddressBookItem: async item => {
    const items = await getAddressBookItems()
    await updateAddressBookItems([...items, item])
  },
  deleteAddressBookItem: async itemId => {
    const items = await getAddressBookItems()
    await updateAddressBookItems(items.filter(i => i.id !== itemId))
  },
  getAddressBookItems,
}
