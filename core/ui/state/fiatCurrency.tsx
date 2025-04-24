import { FiatCurrency } from '@core/config/FiatCurrency'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMutation } from '@tanstack/react-query'

import { fiatCurrencyQueryKey } from '../query/keys'

export const { provider: FiatCurrencyProvider, useValue: useFiatCurrency } =
  getValueProviderSetup<FiatCurrency>('fiatCurrency')

export type SetFiatCurrencyFunction = (
  value: FiatCurrency
) => Promise<void> | void

export const {
  provider: SetFiatCurrencyProvider,
  useValue: useSetFiatCurrency,
} = getValueProviderSetup<SetFiatCurrencyFunction>('setFiatCurrency')

export const useSetFiatCurrencyMutation = () => {
  const setFiatCurrency = useSetFiatCurrency()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (value: FiatCurrency) => {
      await setFiatCurrency(value)
    },
    onSuccess: () => {
      invalidateQueries(fiatCurrencyQueryKey)
    },
  })
}
