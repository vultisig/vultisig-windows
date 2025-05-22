import { View } from '@lib/ui/navigation/View'

import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefaultChainsStorage } from './defaultChains'
import { FiatCurrencyStorage } from './fiatCurrency'
import { LanguageStorage } from './language'
import { OnboardingStorage } from './onboarding'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type GetInitialViewFunction = () => Promise<View>

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
  OnboardingStorage & {
    getInitialView: GetInitialViewFunction
  }
