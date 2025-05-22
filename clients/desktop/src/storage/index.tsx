import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  GetHasFinishedOnboardingFunction,
  GetInitialViewFunction,
  isHasFinishedOnboardingInitially,
  SetHasFinishedOnboardingFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'
import { addressBookStorage } from './addressBook'
import { balanceVisibilityStorage } from './balanceVisibility'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
import { fiatCurrencyStorage } from './fiatCurrency'
import { languageStorage } from './language'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

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
  ...languageStorage,
  ...balanceVisibilityStorage,
  getHasFinishedOnboarding,
  setHasFinishedOnboarding,
  getInitialView,
  ...coinFinderIgnoreStorage,
}
