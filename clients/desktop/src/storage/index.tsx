import { Chain } from '@core/chain/Chain'
import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { Language } from '@core/ui/i18n/Language'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  CreateAddressBookItemFunction,
  CreateVaultCoinFunction,
  CreateVaultCoinsFunction,
  DeleteAddressBookItemFunction,
  DeleteVaultCoinFunction,
  GetAddressBookItemsFunction,
  GetDefaultChainsFunction,
  GetHasFinishedOnboardingFunction,
  GetInitialViewFunction,
  GetIsVaultBalanceVisibleFunction,
  GetLanguageFunction,
  GetVaultsCoinsFunction,
  isHasFinishedOnboardingInitially,
  isVaultBalanceInitallyVisible,
  SetHasFinishedOnboardingFunction,
  SetIsVaultBalanceVisibleFunction,
  SetLanguageFunction,
  UpdateAddressBookItemFunction,
} from '@core/ui/storage/CoreStorage'
import { initialDefaultChains } from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { recordMap } from '@lib/utils/record/recordMap'

import {
  DeleteAddressBookItem,
  DeleteCoin,
  GetAddressBookItem,
  GetAllAddressBookItems,
  GetCoins,
  SaveAddressBookItem,
  SaveCoin,
  SaveCoins,
} from '../../wailsjs/go/storage/Store'
import { persistentStorage } from '../state/persistentState'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { currentVaultIdStorage } from './currentVaultId'
import { fiatCurrencyStorage } from './fiatCurrency'
import { fromStorageCoin, toStorageCoin } from './storageCoin'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

const createVaultCoins: CreateVaultCoinsFunction = async ({
  vaultId,
  coins,
}) => {
  await SaveCoins(vaultId, coins.map(toStorageCoin))
}

const getVaultsCoins: GetVaultsCoinsFunction = async () => {
  const coins = (await GetCoins()) ?? {}
  return recordMap(coins, coins => coins.map(fromStorageCoin))
}

const createVaultCoin: CreateVaultCoinFunction = async ({ vaultId, coin }) => {
  await SaveCoin(vaultId, toStorageCoin(coin))
}

const deleteVaultCoin: DeleteVaultCoinFunction = async ({
  vaultId,
  coinKey,
}) => {
  await DeleteCoin(vaultId, accountCoinKeyToString(coinKey))
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
  createVaultCoins,
  getDefaultChains,
  getVaultsCoins,
  createVaultCoin,
  deleteVaultCoin,
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
