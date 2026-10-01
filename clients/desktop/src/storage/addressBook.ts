import {
  AddressBookStorage,
  initialAddressBookItems,
} from '@core/ui/storage/addressBook'
import { assertChainField } from '@vultisig/core-chain/utils/assertChainField'

import {
  DeleteAddressBookItem,
  GetAddressBookItem,
  GetAllAddressBookItems,
  SaveAddressBookItem,
} from '../../wailsjs/go/storage/Store'

/**
 * Desktop address book storage backed by the Wails SQLite store.
 */
export const addressBookStorage: AddressBookStorage = {
  getAddressBookItems: async () => {
    const addressBookItems =
      (await GetAllAddressBookItems()) ?? initialAddressBookItems
    return addressBookItems.map(assertChainField)
  },
  createAddressBookItem: async item => {
    await SaveAddressBookItem(item)
  },
  updateAddressBookItem: async ({ id, fields }) => {
    const oldAddressBookItem = await GetAddressBookItem(id)

    const newAddressBookItem = {
      ...oldAddressBookItem,
      ...fields,
    }

    await SaveAddressBookItem(newAddressBookItem)
  },
  deleteAddressBookItem: async item => {
    await DeleteAddressBookItem(item)
  },
}
