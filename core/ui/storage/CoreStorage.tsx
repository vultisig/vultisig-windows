import { Chain } from '@core/chain/Chain'
import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { View } from '@lib/ui/navigation/View'

import { AddressBookItem } from '../addressBook/AddressBookItem'
import { Language } from '../i18n/Language'
import { VaultFolder } from '../vault/VaultFolder'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CurrentVaultIdStorage } from './currentVaultId'
import { FiatCurrencyStorage } from './fiatCurrency'
import { VaultsStorage } from './vaults'

type CreateVaultCoinsInput = {
  vaultId: string
  coins: AccountCoin[]
}

export type CreateVaultCoinsFunction = (
  input: CreateVaultCoinsInput
) => Promise<void>

export type GetDefaultChainsFunction = () => Promise<Chain[]>

export type GetVaultsCoinsFunction = () => Promise<
  Record<string, AccountCoin[]>
>

export type GetVaultFoldersFunction = () => Promise<VaultFolder[]>

export type DeleteVaultFolderFunction = (folderId: string) => Promise<void>

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

type CreateCoinInput = {
  vaultId: string
  coin: AccountCoin
}

export type CreateVaultCoinFunction = (input: CreateCoinInput) => Promise<void>

type UpdateVaultFolderInput = {
  id: string
  fields: Partial<Omit<VaultFolder, 'id'>>
}

export type UpdateVaultFolderFunction = (
  input: UpdateVaultFolderInput
) => Promise<void>

type DeleteVaultCoinInput = {
  vaultId: string
  coinKey: AccountCoinKey
}

export type DeleteVaultCoinFunction = (
  input: DeleteVaultCoinInput
) => Promise<void>

export type CreateVaultFolderFunction = (input: VaultFolder) => Promise<void>

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
  VaultsStorage & {
    getVaultsCoins: GetVaultsCoinsFunction
    createVaultCoins: CreateVaultCoinsFunction
    getDefaultChains: GetDefaultChainsFunction
    getVaultFolders: GetVaultFoldersFunction
    deleteVaultFolder: DeleteVaultFolderFunction
    updateVaultFolder: UpdateVaultFolderFunction
    createVaultCoin: CreateVaultCoinFunction
    deleteVaultCoin: DeleteVaultCoinFunction
    createVaultFolder: CreateVaultFolderFunction
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
