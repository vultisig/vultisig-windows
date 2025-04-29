import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { Vault } from '../vault/Vault'

export type SetFiatCurrencyFunction = (
  value: FiatCurrency
) => Promise<void> | void

export type SetCurrentVaultIdFunction = (
  id: string | null
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

export type CoreStorage = {
  getFiatCurrency: GetFiatCurrencyFunction
  setFiatCurrency: SetFiatCurrencyFunction
  setCurrentVaultId: SetCurrentVaultIdFunction
  updateVault: UpdateVaultFunction
  createVault: CreateVaultFunction
  createVaultCoins: CreateVaultCoinsFunction
  getDefaultChains: GetDefaultChainsFunction
  setDefaultChains: SetDefaultChainsFunction
}

export const { useValue: useCoreStorage, provider: CoreStorageProvider } =
  getValueProviderSetup<CoreStorage>('CoreStorage')
