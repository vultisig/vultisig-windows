import { FiatCurrencyStorage } from '@core/ui/storage/fiatCurrency'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { defaultFiatCurrency } from '@vultisig/core-config/FiatCurrency'

export const fiatCurrencyStorage: FiatCurrencyStorage = {
  getFiatCurrency: () =>
    getStorageValue(StorageKey.fiatCurrency, defaultFiatCurrency),
  setFiatCurrency: async value => {
    await setStorageValue(StorageKey.fiatCurrency, value)
  },
}
