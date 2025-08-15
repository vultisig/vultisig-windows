import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import { FiatCurrencyStorage } from '@core/ui/storage/fiatCurrency'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const fiatCurrencyStorage: FiatCurrencyStorage = {
  getFiatCurrency: () =>
    getPersistentState(StorageKey.fiatCurrency, defaultFiatCurrency),
  setFiatCurrency: async value => {
    await setPersistentState(StorageKey.fiatCurrency, value)
  },
}
