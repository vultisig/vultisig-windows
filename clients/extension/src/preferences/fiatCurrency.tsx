import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import {
  GetFiatCurrencyFunction,
  SetFiatCurrencyFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const getFiatCurrency: GetFiatCurrencyFunction = async () =>
  getPersistentState(StorageKey.fiatCurrency, defaultFiatCurrency)

export const setFiatCurrency: SetFiatCurrencyFunction = async (
  value: FiatCurrency
) => {
  await setPersistentState(StorageKey.fiatCurrency, value)
}
