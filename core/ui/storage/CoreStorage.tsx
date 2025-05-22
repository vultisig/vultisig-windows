import { Chain } from '@core/chain/Chain'
import { View } from '@lib/ui/navigation/View'

import { AddressBookItem } from '../addressBook/AddressBookItem'
import { Language } from '../i18n/Language'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CoinsStorage } from './coins'
import { CurrentVaultIdStorage } from './currentVaultId'
import { FiatCurrencyStorage } from './fiatCurrency'
import { VaultFoldersStorage } from './vaultFolders'
import { VaultsStorage } from './vaults'

export type GetDefaultChainsFunction = () => Promise<Chain[]>

export type GetAddressBookItemsFunction = () => Promise<AddressBookItem[]>

type CreateAddressBookItemInput = AddressBookItem

export type CreateAddressBookItemFunction = (
  input: CreateAddressBookItemInput
) => Promise<void>

type UpdateAddressBookItemInput = {
  id: string
  fields: Partial<Omit<AddressBookItem, 'id'>>
}

export type UpdateAddressBookItemFunction = (
  input: UpdateAddressBookItemInput
) => Promise<void>

export type DeleteAddressBookItemFunction = (itemId: string) => Promise<void>

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
  CoinsStorage & {
    getDefaultChains: GetDefaultChainsFunction
    getAddressBookItems: GetAddressBookItemsFunction
    createAddressBookItem: CreateAddressBookItemFunction
    updateAddressBookItem: UpdateAddressBookItemFunction
    deleteAddressBookItem: DeleteAddressBookItemFunction
    getLanguage: GetLanguageFunction
    setLanguage: SetLanguageFunction
    getIsVaultBalanceVisible: GetIsVaultBalanceVisibleFunction
    setIsVaultBalanceVisible: SetIsVaultBalanceVisibleFunction
    getHasFinishedOnboarding: GetHasFinishedOnboardingFunction
    setHasFinishedOnboarding: SetHasFinishedOnboardingFunction
    getInitialView: GetInitialViewFunction
  }
