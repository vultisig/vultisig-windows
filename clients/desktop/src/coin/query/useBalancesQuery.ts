import { getCoinBalance } from '@core/chain/coin/balance'
import { CoinBalanceResolverInput } from '@core/chain/coin/balance/CoinBalanceResolver'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { mergeRecords } from '@lib/utils/record/mergeRecords'
import { useQueries } from '@tanstack/react-query'

import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery'

export const getBalanceQueryKey = (input: CoinBalanceResolverInput) => [
  'coinBalance',
  input,
]

export const useBalancesQuery = (inputs: CoinBalanceResolverInput[]) => {
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
      }
    }),
  })

  return useQueriesToEagerQuery({
    queries,
    joinData: data => mergeRecords(...data),
  })
}
