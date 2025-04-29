import { fiatCurrencyQueryKey } from '@core/ui/query/keys'
import { useCoreStorage } from '@core/ui/state/storage'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useQuery } from '@tanstack/react-query'

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
