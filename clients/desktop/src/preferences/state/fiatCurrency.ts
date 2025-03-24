import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'

import {
  PersistentStateKey,
  usePersistentState,
} from '@core/ui/state/persistentState'

export const useFiatCurrency = () => {
  return usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
}
