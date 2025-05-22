import { View } from '@lib/ui/navigation/View'

import { AddressBookStorage } from './addressBook'
import { BalanceVisibilityStorage } from './balanceVisibility'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefaultChainsStorage } from './defaultChains'
import { FiatCurrencyStorage } from './fiatCurrency'
import { LanguageStorage } from './language'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export const isVaultBalanceInitallyVisible = true

export const isHasFinishedOnboardingInitially = false

export type SetHasFinishedOnboardingFunction = (
  hasFinishedOnboarding: boolean
) => Promise<void>

export type GetHasFinishedOnboardingFunction = () => Promise<boolean>

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
  BalanceVisibilityStorage & {
    getHasFinishedOnboarding: GetHasFinishedOnboardingFunction
    setHasFinishedOnboarding: SetHasFinishedOnboardingFunction
    getInitialView: GetInitialViewFunction
  }
