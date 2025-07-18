import { CoreStorage } from '@core/ui/storage/CoreStorage'

import { addressBookStorage } from './addressBook'
import { balanceVisibilityStorage } from './balanceVisibility'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defaultChainsStorage } from './defaultChains'
import { fiatCurrencyStorage } from './fiatCurrency'
import { initialViewStorage } from './initialView'
import { languageStorage } from './language'
import { onboardingStorage } from './onboarding'
import { passcodeAutoLockStorage } from './passcodeAutoLock'
import { passcodeEncryptionStorage } from './passcodeEncryption'
import { referralsStorage } from './referrals'
import { txSecurityValidationStorage } from './txSecurityValidation'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

export const storage: CoreStorage = {
  ...txSecurityValidationStorage,
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
  ...initialViewStorage,
  ...coinFinderIgnoreStorage,
  ...passcodeEncryptionStorage,
  ...passcodeAutoLockStorage,
  ...referralsStorage,
}
