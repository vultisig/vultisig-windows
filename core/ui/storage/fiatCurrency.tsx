import { FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import { useCoreStorage } from '@core/ui/state/storage'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useFiatCurrencyQuery = () => {
  const { getFiatCurrency } = useCoreStorage()

  return useQuery({
    queryKey: fiatCurrencyQueryKey,
    queryFn: getFiatCurrency,
  })
}

export const useFiatCurrency = () => {
  const { data } = useFiatCurrencyQuery()

  return shouldBeDefined(data)
}

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
