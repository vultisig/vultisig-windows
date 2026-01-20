import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { getCoinBalance } from '@core/chain/coin/balance'
import { CoinBalanceResolverInput } from '@core/chain/coin/balance/resolver'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { mergeRecords } from '@lib/utils/record/mergeRecords'
import { Exact } from '@lib/utils/types/Exact'
import { useQueries } from '@tanstack/react-query'

export function getBalanceQueryKey<T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
): [string, CoinBalanceResolverInput] {
  return ['coinBalance', input]
}

export const getBalanceQueryOptions = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => ({
  queryKey: getBalanceQueryKey(input),
  queryFn: async () => {
    const amount = await getCoinBalance(input)
    return {
      [accountCoinKeyToString(input)]: amount,
    }
  },
  ...persistQueryOptions,
})

export const useBalancesQuery = <T extends CoinBalanceResolverInput>(
  inputs: Exact<CoinBalanceResolverInput, T>[]
) => {
  const queries = useQueries({
    queries: inputs.map(input => getBalanceQueryOptions(input)),
  })

  return useCombineQueries({
    queries,
    joinData: data => mergeRecords(...data),
  })
}
