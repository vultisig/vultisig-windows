import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefaultChainsStorage } from './defaultChains'
import { FiatCurrencyStorage } from './fiatCurrency'
import { InitialViewStorage } from './initialView'
import { LanguageStorage } from './language'
import { OnboardingStorage } from './onboarding'
import { PasscodeEncryptionStorage } from './passcodeEncryption'
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
  OnboardingStorage &
  InitialViewStorage &
  PasscodeEncryptionStorage
