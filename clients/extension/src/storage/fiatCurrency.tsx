import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { FiatCurrencyStorage } from '@core/ui/storage/fiatCurrency'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const fiatCurrencyStorage: FiatCurrencyStorage = {
  getFiatCurrency: () =>
    getPersistentState(StorageKey.fiatCurrency, defaultFiatCurrency),
  setFiatCurrency: async value => {
    await setPersistentState(StorageKey.fiatCurrency, value)
  },
}
