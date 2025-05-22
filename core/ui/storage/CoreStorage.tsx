import { View } from '@lib/ui/navigation/View'

import { Language } from '../i18n/Language'
import { AddressBookStorage } from './addressBook'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { DefaultChainsStorage } from './defaultChains'
import { FiatCurrencyStorage } from './fiatCurrency'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type GetLanguageFunction = () => Promise<Language>

export type SetLanguageFunction = (language: Language) => Promise<void>

export const isVaultBalanceInitallyVisible = true

export const isHasFinishedOnboardingInitially = false

export type SetIsVaultBalanceVisibleFunction = (
  isVaultBalanceVisible: boolean
) => Promise<void>

export type GetIsVaultBalanceVisibleFunction = () => Promise<boolean>

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
  AddressBookStorage & {
    getLanguage: GetLanguageFunction
    setLanguage: SetLanguageFunction
    getIsVaultBalanceVisible: GetIsVaultBalanceVisibleFunction
    setIsVaultBalanceVisible: SetIsVaultBalanceVisibleFunction
    getHasFinishedOnboarding: GetHasFinishedOnboardingFunction
    setHasFinishedOnboarding: SetHasFinishedOnboardingFunction
    getInitialView: GetInitialViewFunction
  }
