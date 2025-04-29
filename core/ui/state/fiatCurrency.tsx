import { FiatCurrency } from '@core/config/FiatCurrency'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMutation } from '@tanstack/react-query'

import { fiatCurrencyQueryKey } from '../query/keys'
import { useCoreWriteStorage } from './storage/write'

export const { provider: FiatCurrencyProvider, useValue: useFiatCurrency } =
  getValueProviderSetup<FiatCurrency>('fiatCurrency')

export const useSetFiatCurrencyMutation = () => {
  const { setFiatCurrency } = useCoreWriteStorage()
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
