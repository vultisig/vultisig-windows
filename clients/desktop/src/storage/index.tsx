import { CoreStorage } from '@core/ui/storage/CoreStorage'

import { addressBookStorage } from './addressBook'
import { balanceVisibilityStorage } from './balanceVisibility'
import { blockaidStorage } from './blockaid'
import { circleVisibilityStorage } from './circleVisibility'
import { coinFinderIgnoreStorage } from './coinFinderIgnore'
import { coinsStorage } from './coins'
import { currentVaultIdStorage } from './currentVaultId'
import { defiChainsStorage } from './defiChains'
import { defiPositionsStorage } from './defiPositions'
import { dismissedBannersStorage } from './dismissedBanners'
import { fiatCurrencyStorage } from './fiatCurrency'
import { hasSeenNotificationPromptStorage } from './hasSeenNotificationPrompt'
import { languageStorage } from './language'
import { mldsaEnabledStorage } from './mldsaEnabled'
import { onboardingStorage } from './onboarding'
import { passcodeAutoLockStorage } from './passcodeAutoLock'
import { passcodeEncryptionStorage } from './passcodeEncryption'
import { referralsStorage } from './referrals'
import { transactionHistoryStorage } from './transactionHistory'
import { tssBatchingEnabledStorage } from './tssBatchingEnabled'
import { vaultFoldersStorage } from './vaultFolders'
import { vaultsStorage } from './vaults'

export const storage: CoreStorage = {
  ...fiatCurrencyStorage,
  ...currentVaultIdStorage,
  ...vaultsStorage,
  ...vaultFoldersStorage,
  ...coinsStorage,
  ...defiChainsStorage,
  ...defiPositionsStorage,
  ...addressBookStorage,
  ...languageStorage,
  ...balanceVisibilityStorage,
  ...blockaidStorage,
  ...onboardingStorage,
  ...hasSeenNotificationPromptStorage,
  ...coinFinderIgnoreStorage,
  ...passcodeEncryptionStorage,
  ...passcodeAutoLockStorage,
  ...referralsStorage,
  ...dismissedBannersStorage,
  ...circleVisibilityStorage,
  ...mldsaEnabledStorage,
  ...tssBatchingEnabledStorage,
  ...transactionHistoryStorage,
}
