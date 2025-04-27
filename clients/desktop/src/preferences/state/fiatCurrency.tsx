import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import {
  FiatCurrencyProvider as BaseFiatCurrencyProvider,
  SetFiatCurrencyProvider,
} from '@core/ui/state/fiatCurrency'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'
import { ChildrenProp } from '@lib/ui/props'

import { usePersistentState } from '../../state/persistentState'

const useFiatCurrency = () => {
  return usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  )
}

export const FiatCurrencyProviders = ({ children }: ChildrenProp) => {
  const [fiatCurrency, setFiatCurrency] = useFiatCurrency()

  return (
    <BaseFiatCurrencyProvider value={fiatCurrency}>
      <SetFiatCurrencyProvider value={setFiatCurrency}>
        {children}
      </SetFiatCurrencyProvider>
    </BaseFiatCurrencyProvider>
  )
}
