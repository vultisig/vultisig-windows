import { FiatCurrencyStorage } from '@core/ui/storage/fiatCurrency'
import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  defaultFiatCurrency,
  FiatCurrency,
} from '@vultisig/core-config/FiatCurrency'

import { persistentStorage } from '../state/persistentState'

export const fiatCurrencyStorage: FiatCurrencyStorage = {
  getFiatCurrency: async () => {
    const value = persistentStorage.getItem<FiatCurrency>(
      StorageKey.fiatCurrency
    )

    if (value === undefined) {
      return defaultFiatCurrency
    }

    return value
  },
  setFiatCurrency: async (currency: FiatCurrency) => {
    persistentStorage.setItem(StorageKey.fiatCurrency, currency)
  },
}
