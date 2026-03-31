import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type GetFiatCurrencyFunction = () => Promise<FiatCurrency>

type SetFiatCurrencyFunction = (value: FiatCurrency) => Promise<void>

export type FiatCurrencyStorage = {
  getFiatCurrency: GetFiatCurrencyFunction
  setFiatCurrency: SetFiatCurrencyFunction
}

export const useFiatCurrencyQuery = () => {
  const { getFiatCurrency } = useCore()

  return useQuery({
    queryKey: [StorageKey.fiatCurrency],
    queryFn: getFiatCurrency,
    ...noRefetchQueryOptions,
  })
}

export const useFiatCurrency = () => {
  const { data } = useFiatCurrencyQuery()

  return shouldBeDefined(data)
}

export const useSetFiatCurrencyMutation = () => {
  const { setFiatCurrency } = useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (value: FiatCurrency) => {
      await setFiatCurrency(value)
      await refetchQueries([StorageKey.fiatCurrency])
    },
  })
}
