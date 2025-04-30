import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { CurrentVaultId } from '../storage/currentVaultId'
import { Vault } from '../vault/Vault'
import { VaultFolder } from '../vault/VaultFolder'

export type SetFiatCurrencyFunction = (
  value: FiatCurrency
) => Promise<void> | void

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

export type SetDefaultChainsFunction = (chains: Chain[]) => Promise<void> | void

type GetDefaultChainsFunction = () => Promise<Chain[]> | Chain[]

export type GetFiatCurrencyFunction = () => Promise<FiatCurrency> | FiatCurrency

export type GetCurrentVaultIdFunction = () =>
  | Promise<CurrentVaultId>
  | CurrentVaultId

export type SetCurrentVaultIdFunction = (
  id: CurrentVaultId
) => Promise<void> | void

export type GetVaultsFunction = () => Promise<Vault[]>

export type GetVaultsCoinsFunction = () => Promise<
  Record<string, AccountCoin[]>
>

export type GetVaultFoldersFunction = () => Promise<VaultFolder[]>

export type DeleteVaultFunction = (vaultId: string) => Promise<void>

export type DeleteVaultFolderFunction = (folderId: string) => Promise<void>

export type CoreStorage = {
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
  setDefaultChains: SetDefaultChainsFunction
  getVaultFolders: GetVaultFoldersFunction
  deleteVault: DeleteVaultFunction
  deleteVaultFolder: DeleteVaultFolderFunction
}

export const { useValue: useCoreStorage, provider: CoreStorageProvider } =
  getValueProviderSetup<CoreStorage>('CoreStorage')
