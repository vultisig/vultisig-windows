import { initialCoreView } from '@core/ui/navigation/CoreView'
import {
  CoreStorage,
  GetInitialViewFunction,
} from '@core/ui/storage/CoreStorage'

import { addressBookStorage } from './addressBook'
import { balanceVisibilityStorage } from './balanceVisibility'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
import { fiatCurrencyStorage } from './fiatCurrency'
import { languageStorage } from './language'
import { onboardingStorage } from './onboarding'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

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
  ...onboardingStorage,
  getInitialView,
  ...coinFinderIgnoreStorage,
}
