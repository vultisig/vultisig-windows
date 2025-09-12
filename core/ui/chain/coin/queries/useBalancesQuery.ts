import { getCoinBalance } from '@core/chain/coin/balance'
import { CoinBalanceResolverInput } from '@core/chain/coin/balance/resolver'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { useQueriesToEagerQuery } from '@lib/ui/query/hooks/useQueriesToEagerQuery'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { mergeRecords } from '@lib/utils/record/mergeRecords'
import { Exact } from '@lib/utils/types/Exact'
import { useQueries } from '@tanstack/react-query'

export function getBalanceQueryKey<T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
): [string, CoinBalanceResolverInput] {
  return ['coinBalance', input]
}

export const useBalancesQuery = <T extends CoinBalanceResolverInput>(
  inputs: Exact<CoinBalanceResolverInput, T>[]
) => {
  const queries = useQueries({
    queries: inputs.map(input => {
      return {
        queryKey: getBalanceQueryKey(input),
        queryFn: async () => {
          const amount = await getCoinBalance(input)

          return {
            [coinKeyToString(input)]: amount,
          }
        },
        ...persistQueryOptions,
      }
    }),
  })

  return useQueriesToEagerQuery({
    queries,
    joinData: data => mergeRecords(...data),
  })
}
