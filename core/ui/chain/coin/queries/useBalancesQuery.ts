import { getCoinBalance } from '@core/chain/coin/balance'
import { CoinBalanceResolverInput } from '@core/chain/coin/balance/resolver'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { mergeRecords } from '@lib/utils/record/mergeRecords'
import { Exact } from '@lib/utils/types/Exact'
import { useQueries } from '@tanstack/react-query'

export type BalanceQueryInput = CoinBalanceResolverInput & {
  key?: string
}

export function getBalanceQueryKey<T extends BalanceQueryInput>(
  input: Exact<BalanceQueryInput, T>
): [string, BalanceQueryInput] {
  return ['coinBalance', input]
}

export const getBalanceQueryOptions = <T extends BalanceQueryInput>(
  input: Exact<BalanceQueryInput, T>
) => ({
  queryKey: getBalanceQueryKey(input),
  queryFn: async () => {
    const amount = await getCoinBalance(input)
    return {
      [input.key ?? coinKeyToString(input)]: amount,
    }
  },
  ...persistQueryOptions,
})

export const useBalancesQuery = <T extends BalanceQueryInput>(
  inputs: Exact<BalanceQueryInput, T>[]
) => {
  const queries = useQueries({
    queries: inputs.map(input => getBalanceQueryOptions(input)),
  })

  return useCombineQueries({
    queries,
    joinData: data => mergeRecords(...data),
  })
}
