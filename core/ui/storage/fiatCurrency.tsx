import { FiatCurrency } from '@core/config/FiatCurrency'
import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'

export const useFiatCurrencyQuery = () => {
  const { getFiatCurrency } = useCore()

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
  const { setFiatCurrency } = useCore()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (value: FiatCurrency) => {
      await setFiatCurrency(value)
      await invalidateQueries(fiatCurrencyQueryKey)
    },
  })
}
