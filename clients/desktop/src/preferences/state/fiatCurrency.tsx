import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import { FiatCurrencyProvider as CoreFiatCurrencyProvider } from '@core/ui/state/fiatCurrency'
import { ChildrenProp } from '@lib/ui/props'

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

export const FiatCurrencyProvider = ({ children }: ChildrenProp) => {
  const [fiatCurrency] = useFiatCurrency()

  return (
    <CoreFiatCurrencyProvider value={fiatCurrency}>
      {children}
    </CoreFiatCurrencyProvider>
  )
}
