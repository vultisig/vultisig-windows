import { Query } from '@lib/ui/query/Query'
import { useQuery } from '@tanstack/react-query'
import {
  AccountCoinKey,
  accountCoinKeyToString,
} from '@vultisig/core-chain/coin/AccountCoin'
import { CoinBalanceResolverInput } from '@vultisig/core-chain/coin/balance/resolver'
import { Exact } from '@vultisig/lib-utils/types/Exact'
import { useMemo, useRef } from 'react'

import { getBalanceQueryOptions } from '../../../chain/coin/queries/useBalancesQuery'

export const getSendBalanceQueryOptions = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => ({
  ...getBalanceQueryOptions(input),
  refetchOnMount: 'always' as const,
  staleTime: 0,
})

type FreshSendBalanceQueryInput<E> = {
  balanceKey: string
  data: Record<string, bigint> | undefined
  dataUpdatedAt: number
  error: E | null
  freshnessBoundary: number
}

export const getFreshSendBalanceQuery = <E>({
  balanceKey,
  data,
  dataUpdatedAt,
  error,
  freshnessBoundary,
}: FreshSendBalanceQueryInput<E>): Query<bigint, E> => {
  if (dataUpdatedAt < freshnessBoundary) {
    return {
      data: undefined,
      error,
      isPending: error === null,
    }
  }

  return {
    data: error === null ? data?.[balanceKey] : undefined,
    error,
    isPending: false,
  }
}

/**
 * Send must not trust a persisted balance until this mounted flow has fetched
 * it again. A stale cached amount is hidden while that mandatory refresh runs,
 * and remains unavailable if the refresh fails.
 */
export const useSendBalanceQuery = <T extends CoinBalanceResolverInput>(
  input: Exact<CoinBalanceResolverInput, T>
) => {
  const balanceKey = accountCoinKeyToString(input as AccountCoinKey)
  const freshness = useRef({ balanceKey, boundary: Date.now() })

  if (freshness.current.balanceKey !== balanceKey) {
    freshness.current = { balanceKey, boundary: Date.now() }
  }

  const query = useQuery(getSendBalanceQueryOptions(input))

  return useMemo(
    () =>
      getFreshSendBalanceQuery({
        balanceKey,
        data: query.data,
        dataUpdatedAt: query.dataUpdatedAt,
        error: query.error,
        freshnessBoundary: freshness.current.boundary,
      }),
    [balanceKey, query.data, query.dataUpdatedAt, query.error]
  )
}
