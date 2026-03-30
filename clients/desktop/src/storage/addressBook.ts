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

export const addressBookStorage: AddressBookStorage = {
  getAddressBookItems: async () => {
    const addressBookItems =
      (await GetAllAddressBookItems()) ?? initialAddressBookItems
    return addressBookItems.map(assertChainField)
  },
  createAddressBookItem: async item => {
    await SaveAddressBookItem(item)
  },
  updateAddressBookItem: async item => {
    const oldAddressBookItem = await GetAddressBookItem(item.id)

    const newAddressBookItem = {
      ...oldAddressBookItem,
      ...item,
    }

    await SaveAddressBookItem(newAddressBookItem)
  },
  deleteAddressBookItem: async item => {
    await DeleteAddressBookItem(item)
  },
}
