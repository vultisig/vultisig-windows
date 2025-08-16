import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { BlockaidStorage } from './blockaid'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefaultChainsStorage } from './defaultChains'
import { FiatCurrencyStorage } from './fiatCurrency'
import { LanguageStorage } from './language'
import { OnboardingStorage } from './onboarding'
import { PasscodeAutoLockStorage } from './passcodeAutoLock'
import { PasscodeEncryptionStorage } from './passcodeEncryption'
import { ReferralsStorage } from './referrals'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type CoreStorage = CoinFinderIgnoreStorage &
  FiatCurrencyStorage &
  CurrentVaultIdStorage &
  VaultsStorage &
  VaultFoldersStorage &
  CoinsStorage &
  DefaultChainsStorage &
  AddressBookStorage &
  LanguageStorage &
  BalanceVisibilityStorage &
  BlockaidStorage &
  OnboardingStorage &
  ReferralsStorage &
  PasscodeEncryptionStorage &
  PasscodeAutoLockStorage
