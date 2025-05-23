import { Chain } from '@core/chain/Chain'
import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { View } from '@lib/ui/navigation/View'

import { AddressBookItem } from '../addressBook/AddressBookItem'
import { Language } from '../i18n/Language'
import { Vault } from '../vault/Vault'
import { VaultFolder } from '../vault/VaultFolder'
import { CoinFinderIgnoreStorage } from './coinFinderIgnore'
import { CurrentVaultId } from './currentVaultId'

export type SetFiatCurrencyFunction = (value: FiatCurrency) => Promise<void>

export type UpdateVaultInput = {
  vaultId: string
  fields: Partial<Vault>
}

export type CreateVaultFunction = (vault: Vault) => Promise<Vault>

export type UpdateVaultFunction = (input: UpdateVaultInput) => Promise<Vault>

type CreateVaultCoinsInput = {
  vaultId: string
  coins: AccountCoin[]
}

export type CreateVaultCoinsFunction = (
  input: CreateVaultCoinsInput
) => Promise<void>

export type GetDefaultChainsFunction = () => Promise<Chain[]>

export type GetFiatCurrencyFunction = () => Promise<FiatCurrency>

type GetCurrentVaultIdFunction = () => Promise<CurrentVaultId>

export type SetCurrentVaultIdFunction = (id: CurrentVaultId) => Promise<void>

export type GetVaultsFunction = () => Promise<Vault[]>

export type GetVaultsCoinsFunction = () => Promise<
  Record<string, AccountCoin[]>
>

export type GetVaultFoldersFunction = () => Promise<VaultFolder[]>

export type DeleteVaultFunction = (vaultId: string) => Promise<void>

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

export type CoreStorage = CoinFinderIgnoreStorage & {
  getFiatCurrency: GetFiatCurrencyFunction
  setFiatCurrency: SetFiatCurrencyFunction
  getCurrentVaultId: GetCurrentVaultIdFunction
  setCurrentVaultId: SetCurrentVaultIdFunction
  getVaults: GetVaultsFunction
  getVaultsCoins: GetVaultsCoinsFunction
  updateVault: UpdateVaultFunction
  createVault: CreateVaultFunction
  createVaultCoins: CreateVaultCoinsFunction
  getDefaultChains: GetDefaultChainsFunction
  getVaultFolders: GetVaultFoldersFunction
  deleteVault: DeleteVaultFunction
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
