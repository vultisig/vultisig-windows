import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { CoinBalanceResolverInput } from '@core/chain/coin/balance/resolver'
import { Exact } from '@lib/utils/types/Exact'
import { useMemo } from 'react'

import { useBalancesQuery } from './useBalancesQuery'

export const useBalanceQuery = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => {
  const query = useBalancesQuery([input])

  return useMemo(() => {
    const error = query.errors[0] ?? null

    const data = query.data?.[accountCoinKeyToString(input)]

    return {
      data,
      isPending: query.isPending,
      error,
    }
  }, [query, input])
}
