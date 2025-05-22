import { Language } from '@core/ui/i18n/Language'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  GetHasFinishedOnboardingFunction,
  GetInitialViewFunction,
  GetIsVaultBalanceVisibleFunction,
  GetLanguageFunction,
  isHasFinishedOnboardingInitially,
  isVaultBalanceInitallyVisible,
  SetHasFinishedOnboardingFunction,
  SetIsVaultBalanceVisibleFunction,
  SetLanguageFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'
import { addressBookStorage } from './addressBook'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
import { fiatCurrencyStorage } from './fiatCurrency'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

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
  ...addressBookStorage,
  getLanguage,
  setLanguage,
  getIsVaultBalanceVisible,
  setIsVaultBalanceVisible,
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
  getInitialView,
  ...coinFinderIgnoreStorage,
}
