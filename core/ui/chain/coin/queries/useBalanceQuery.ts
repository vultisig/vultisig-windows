import { CoinBalanceResolverInput } from '@core/chain/coin/balance/resolver'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
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
      isPending: query.isPending,
      error,
    }
  }, [query, input])
}

export const useBalance = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => {
  const { data } = useBalanceQuery(input)

  return shouldBePresent(data, `${coinKeyToString(input)} balance`)
}
