import { CoreStorage } from '@core/ui/storage/CoreStorage'

import { getInitialView } from '../navigation/state'
import { addressBookStorage } from './addressBook'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
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

export const storage: CoreStorage = {
  ...coinFinderIgnoreStorage,
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
}
