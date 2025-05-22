import {
  CoreStorage,
  CreateAddressBookItemFunction,
  DeleteAddressBookItemFunction,
  UpdateAddressBookItemFunction,
} from '@core/ui/storage/CoreStorage'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getDefaultChains } from '../chain/state/defaultChains'
import { getInitialView } from '../navigation/state'
import { getAddressBookItems, updateAddressBookItems } from './addressBook'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { fiatCurrencyStorage } from './fiatCurrency'
import { getLanguage, setLanguage } from './language'
import {
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
} from './onboarding'
import {
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
} from './vaultBalanceVisibility'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

const createAddressBookItem: CreateAddressBookItemFunction = async item => {
  const items = await getAddressBookItems()
  await updateAddressBookItems([...items, item])
}

const updateAddressBookItem: UpdateAddressBookItemFunction = async ({
  id,
  fields,
}) => {
  const items = await getAddressBookItems()
  const itemIndex = shouldBePresent(items.findIndex(item => item.id === id))

  const updatedAddressBookItems = updateAtIndex(items, itemIndex, item => ({
    ...item,
    ...fields,
  }))

  await updateAddressBookItems(updatedAddressBookItems)
}

const deleteAddressBookItem: DeleteAddressBookItemFunction = async itemId => {
  const items = await getAddressBookItems()
  await updateAddressBookItems(items.filter(i => i.id !== itemId))
}

export const storage: CoreStorage = {
  ...coinFinderIgnoreStorage,
  ...fiatCurrencyStorage,
  ...currentVaultIdStorage,
  ...vaultsStorage,
  ...vaultFoldersStorage,
  ...coinsStorage,
  getDefaultChains,
  getAddressBookItems,
  createAddressBookItem,
  updateAddressBookItem,
  deleteAddressBookItem,
  getLanguage,
  setLanguage,
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
  getInitialView,
}
