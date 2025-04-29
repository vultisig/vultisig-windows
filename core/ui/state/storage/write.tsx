import { FiatCurrency } from '@core/config/FiatCurrency'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export type SetFiatCurrencyFunction = (
  value: FiatCurrency
) => Promise<void> | void

export type SetCurrentVaultIdFunction = (
  id: string | null
) => Promise<void> | void

export type CoreWriteStorage = {
  setFiatCurrency: SetFiatCurrencyFunction
  setCurrentVaultId: SetCurrentVaultIdFunction
}

export const {
  useValue: useCoreWriteStorage,
  provider: CoreWriteStorageProvider,
} = getValueProviderSetup<CoreWriteStorage>('CoreWriteStorage')
