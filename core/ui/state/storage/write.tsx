import { FiatCurrency } from '@core/config/FiatCurrency'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { Vault } from '../../vault/Vault'

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

export type UpdateVaultFunction = (input: UpdateVaultInput) => Promise<Vault>

export type CoreWriteStorage = {
  setFiatCurrency: SetFiatCurrencyFunction
  setCurrentVaultId: SetCurrentVaultIdFunction
  updateVault: UpdateVaultFunction
}

export const {
  useValue: useCoreWriteStorage,
  provider: CoreWriteStorageProvider,
} = getValueProviderSetup<CoreWriteStorage>('CoreWriteStorage')
