import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import {
  SetFiatCurrencyFunction,
  SetFiatCurrencyProvider as BaseSetFiatCurrencyProvider,
} from '@core/ui/state/fiatCurrency'
import { ChildrenProp } from '@lib/ui/props'

import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = fiatCurrencyQueryKey

export const useFiatCurrencyQuery = () => {
  return usePersistentStateQuery<FiatCurrency>(key, defaultFiatCurrency)
}

const setFiatCurrency: SetFiatCurrencyFunction = async (
  value: FiatCurrency
) => {
  await setPersistentState(key, value)
}

export const SetFiatCurrencyProvider = ({ children }: ChildrenProp) => {
  return (
    <BaseSetFiatCurrencyProvider value={setFiatCurrency}>
      {children}
    </BaseSetFiatCurrencyProvider>
  )
}
