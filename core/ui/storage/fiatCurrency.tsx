import { FiatCurrency } from '@core/config/FiatCurrency'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const useFiatCurrencyQuery = () => {
  const { getFiatCurrency } = useCore()

  return useQuery({
    queryKey: [StorageKey.fiatCurrency],
    queryFn: getFiatCurrency,
    ...fixedDataQueryOptions,
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
      await invalidateQueries([StorageKey.fiatCurrency])
    },
  })
}
