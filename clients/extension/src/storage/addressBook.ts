import { AddressBookItem } from '@core/ui/address-book/model'
import {
  AddressBookStorage,
  GetAddressBookItemsFunction,
  initialAddressBookItems,
} from '@core/ui/storage/addressBook'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

const getAddressBookItems: GetAddressBookItemsFunction = async () => {
  return getPersistentState(
    StorageKey.addressBookItems,
    initialAddressBookItems
  )
}

const updateAddressBookItems = async (items: AddressBookItem[]) => {
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
