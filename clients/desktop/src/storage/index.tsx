import { assertChainField } from '@core/chain/utils/assertChainField'
import { Language } from '@core/ui/i18n/Language'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  CreateAddressBookItemFunction,
  DeleteAddressBookItemFunction,
  GetAddressBookItemsFunction,
  GetHasFinishedOnboardingFunction,
  GetInitialViewFunction,
  GetIsVaultBalanceVisibleFunction,
  GetLanguageFunction,
  isHasFinishedOnboardingInitially,
  isVaultBalanceInitallyVisible,
  SetHasFinishedOnboardingFunction,
  SetIsVaultBalanceVisibleFunction,
  SetLanguageFunction,
  UpdateAddressBookItemFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import {
  DeleteAddressBookItem,
  GetAddressBookItem,
  GetAllAddressBookItems,
  SaveAddressBookItem,
} from '../../wailsjs/go/storage/Store'
import { persistentStorage } from '../state/persistentState'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
import { fiatCurrencyStorage } from './fiatCurrency'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

const getAddressBookItems: GetAddressBookItemsFunction = async () => {
  const addressBookItems = (await GetAllAddressBookItems()) ?? []
  return addressBookItems.map(assertChainField)
}

const createAddressBookItem: CreateAddressBookItemFunction = async item => {
  await SaveAddressBookItem(item)
}

const updateAddressBookItem: UpdateAddressBookItemFunction = async item => {
  const oldAddressBookItem = await GetAddressBookItem(item.id)

  const newAddressBookItem = {
    ...oldAddressBookItem,
    ...item,
  }

  await SaveAddressBookItem(newAddressBookItem)
}

const deleteAddressBookItem: DeleteAddressBookItemFunction = async item => {
  await DeleteAddressBookItem(item)
}

const getLanguage: GetLanguageFunction = async () => {
  const value = persistentStorage.getItem<Language>(StorageKey.language)

  if (value === undefined) {
    return primaryLanguage
  }

  return value
}

const setLanguage: SetLanguageFunction = async language => {
  persistentStorage.setItem(StorageKey.language, language)
}

const getIsVaultBalanceVisible: GetIsVaultBalanceVisibleFunction = async () => {
  const value = persistentStorage.getItem<boolean>(
    StorageKey.isVaultBalanceVisible
  )

  if (value === undefined) {
    return isVaultBalanceInitallyVisible
  }

  return value
}

const setIsVaultBalanceVisible: SetIsVaultBalanceVisibleFunction =
  async isVaultBalanceVisible => {
    persistentStorage.setItem(
      StorageKey.isVaultBalanceVisible,
      isVaultBalanceVisible
    )
  }

const getHasFinishedOnboarding: GetHasFinishedOnboardingFunction = async () => {
  const value = persistentStorage.getItem<boolean>(
    StorageKey.hasFinishedOnboarding
  )

  if (value === undefined) {
    return isHasFinishedOnboardingInitially
  }

  return value
}

const setHasFinishedOnboarding: SetHasFinishedOnboardingFunction =
  async hasFinishedOnboarding => {
    persistentStorage.setItem(
      StorageKey.hasFinishedOnboarding,
      hasFinishedOnboarding
    )
  }

const getInitialView: GetInitialViewFunction = async () => initialCoreView

export const storage: CoreStorage = {
  ...fiatCurrencyStorage,
  ...currentVaultIdStorage,
  ...vaultsStorage,
  ...vaultFoldersStorage,
  ...coinsStorage,
  ...defaultChainsStorage,
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
  ...coinFinderIgnoreStorage,
}
