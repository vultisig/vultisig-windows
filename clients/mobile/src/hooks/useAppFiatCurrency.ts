import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'

import { PersistentStateKey, usePersistentState } from './usePersistenStorage'

export const useAppFiatCurrency = () => {
  return usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
}
