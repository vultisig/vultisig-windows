import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import {
  GetFiatCurrencyFunction,
  SetFiatCurrencyFunction,
} from '@core/ui/state/storage'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = fiatCurrencyQueryKey

export const getFiatCurrency: GetFiatCurrencyFunction = async () =>
  getPersistentState(key, defaultFiatCurrency)

export const setFiatCurrency: SetFiatCurrencyFunction = async (
  value: FiatCurrency
) => {
  await setPersistentState(key, value)
}
