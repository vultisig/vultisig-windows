import { CoinBalanceResolverInput } from '@core/chain/coin/balance/CoinBalanceResolver'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { pick } from '@lib/utils/record/pick'
import { Exact } from '@lib/utils/types/Exact'
import { useMemo } from 'react'

import { useBalancesQuery } from './useBalancesQuery'

export const useBalanceQuery = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => {
  const query = useBalancesQuery([input])

  return useMemo(() => {
    const error = query.errors[0] ?? null

    const data = query.data?.[coinKeyToString(input)]

    return {
      data,
      ...pick(query, ['isPending', 'isLoading']),
      error,
    }
  }, [query, input])
}
