import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { BlockaidStorage } from './blockaid'
import { CircleVisibilityStorage } from './circleVisibility'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefiChainsStorage } from './defiChains'
import { DefiPositionsStorage } from './defiPositions'
import { DismissedBannersStorage } from './dismissedBanners'
import { FiatCurrencyStorage } from './fiatCurrency'
import { LanguageStorage } from './language'
import { OnboardingStorage } from './onboarding'
import { PasscodeAutoLockStorage } from './passcodeAutoLock'
import { PasscodeEncryptionStorage } from './passcodeEncryption'
import { ReferralsStorage } from './referrals'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type CoreStorage = CoinFinderIgnoreStorage &
  CircleVisibilityStorage &
  DefiChainsStorage &
  DefiPositionsStorage &
  FiatCurrencyStorage &
  CurrentVaultIdStorage &
  VaultsStorage &
  VaultFoldersStorage &
  CoinsStorage &
  AddressBookStorage &
  LanguageStorage &
  BalanceVisibilityStorage &
  BlockaidStorage &
  OnboardingStorage &
  ReferralsStorage &
  PasscodeEncryptionStorage &
  PasscodeAutoLockStorage &
  DismissedBannersStorage
