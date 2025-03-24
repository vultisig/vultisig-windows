import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useFiatCurrency = () => {
  return usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
}
