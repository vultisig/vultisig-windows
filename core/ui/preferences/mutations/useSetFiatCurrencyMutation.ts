import { FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import { useCoreStorage } from '@core/ui/state/storage'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

export const useSetFiatCurrencyMutation = () => {
  const { setFiatCurrency } = useCoreStorage()
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
