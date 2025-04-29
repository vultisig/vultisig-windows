import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import { SetFiatCurrencyFunction } from '@core/ui/state/storage'

import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = fiatCurrencyQueryKey

export const useFiatCurrencyQuery = () => {
  return usePersistentStateQuery<FiatCurrency>(key, defaultFiatCurrency)
}

export const setFiatCurrency: SetFiatCurrencyFunction = async (
  value: FiatCurrency
) => {
  await setPersistentState(key, value)
}
