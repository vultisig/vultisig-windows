import { Chain } from '@core/chain/Chain'
import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { Language } from '@core/ui/i18n/Language'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  CreateAddressBookItemFunction,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  CreateVaultFolderFunction,
  CreateVaultFunction,
  DeleteAddressBookItemFunction,
  DeleteVaultCoinFunction,
  DeleteVaultFolderFunction,
  DeleteVaultFunction,
  GetAddressBookItemsFunction,
  GetDefaultChainsFunction,
  GetHasFinishedOnboardingFunction,
  GetInitialViewFunction,
  GetIsVaultBalanceVisibleFunction,
  GetLanguageFunction,
  GetVaultFoldersFunction,
  GetVaultsCoinsFunction,
  GetVaultsFunction,
  isHasFinishedOnboardingInitially,
  isVaultBalanceInitallyVisible,
  SetHasFinishedOnboardingFunction,
  SetIsVaultBalanceVisibleFunction,
  SetLanguageFunction,
  UpdateAddressBookItemFunction,
  UpdateVaultFolderFunction,
  UpdateVaultFunction,
} from '@core/ui/storage/CoreStorage'
import { initialCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { initialDefaultChains } from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { recordMap } from '@lib/utils/record/recordMap'

import {
  DeleteAddressBookItem,
  DeleteCoin,
  DeleteVault,
  DeleteVaultFolder,
  GetAddressBookItem,
  GetAllAddressBookItems,
  GetCoins,
  GetVault,
  GetVaultFolder,
  GetVaultFolders,
  GetVaults,
  SaveAddressBookItem,
  SaveCoin,
  SaveCoins,
  SaveVault,
  SaveVaultFolder,
} from '../../wailsjs/go/storage/Store'
import { persistentStorage } from '../state/persistentState'
import { fromStorageVault, toStorageVault } from '../vault/utils/storageVault'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { fromStorageCoin, toStorageCoin } from './storageCoin'

const updateVault: UpdateVaultFunction = async ({ vaultId, fields }) => {
  const oldStorageVault = await GetVault(vaultId)
  const oldVault = fromStorageVault(oldStorageVault)

  const newVault = { ...oldVault, ...fields }
  const newStorageVault = toStorageVault(newVault)

  await SaveVault(newStorageVault)

  return newVault
}

const createVault: CreateVaultFunction = async vault => {
  const storageVault = toStorageVault(vault)

  await SaveVault(storageVault)

  return vault
}

const createVaultCoins: CreateVaultCoinsFunction = async ({
  vaultId,
  coins,
}) => {
  await SaveCoins(vaultId, coins.map(toStorageCoin))
}

const getVaults: GetVaultsFunction = async () => {
  const storageVaults = (await GetVaults()) ?? []
  return storageVaults.map(fromStorageVault)
}

const getVaultsCoins: GetVaultsCoinsFunction = async () => {
  const coins = (await GetCoins()) ?? {}
  return recordMap(coins, coins => coins.map(fromStorageCoin))
}

const getVaultFolders: GetVaultFoldersFunction = async () => {
  const storageVaultFolders = (await GetVaultFolders()) ?? []
  return storageVaultFolders
}

const deleteVault: DeleteVaultFunction = async vaultId => {
  await DeleteVault(vaultId)
}

const deleteVaultFolder: DeleteVaultFolderFunction = async folderId => {
  await DeleteVaultFolder(folderId)
}

const createVaultCoin: CreateVaultCoinFunction = async ({ vaultId, coin }) => {
  await SaveCoin(vaultId, toStorageCoin(coin))
}

const updateVaultFolder: UpdateVaultFolderFunction = async ({ id, fields }) => {
  const folder = await GetVaultFolder(id)

  const updatedFolder = {
    ...folder,
    ...fields,
  }

  await SaveVaultFolder(updatedFolder)
}

const deleteVaultCoin: DeleteVaultCoinFunction = async ({
  vaultId,
  coinKey,
}) => {
  await DeleteCoin(vaultId, accountCoinKeyToString(coinKey))
}

const createVaultFolder: CreateVaultFolderFunction = async folder => {
  await SaveVaultFolder(folder)
}

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

const getDefaultChains: GetDefaultChainsFunction = async () => {
  const value = persistentStorage.getItem<Chain[]>(StorageKey.defaultChains)

  if (value === undefined) {
    return initialDefaultChains
  }

  return value
}

const getFiatCurrency = async () => {
  const value = persistentStorage.getItem<FiatCurrency>(StorageKey.fiatCurrency)

  if (value === undefined) {
    return defaultFiatCurrency
  }

  return value
}

const setFiatCurrency = async (currency: FiatCurrency) => {
  persistentStorage.setItem(StorageKey.fiatCurrency, currency)
}

const getCurrentVaultId = async () => {
  const value = persistentStorage.getItem<CurrentVaultId>(
    StorageKey.currentVaultId
  )

  if (value === undefined) {
    return initialCurrentVaultId
  }

  return value
}

const setCurrentVaultId = async (vaultId: CurrentVaultId) => {
  persistentStorage.setItem(StorageKey.currentVaultId, vaultId)
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
  setFiatCurrency,
  setCurrentVaultId,
  getFiatCurrency,
  getCurrentVaultId,
  updateVault,
  createVault,
  createVaultCoins,
  getDefaultChains,
  getVaults,
  getVaultsCoins,
  getVaultFolders,
  deleteVault,
  deleteVaultFolder,
  createVaultCoin,
  updateVaultFolder,
  deleteVaultCoin,
  createVaultFolder,
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
