import {
  useQueries,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

import { Query } from '../Query'

export const usePotentialQuery = <
  T,
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  input: T | undefined,
  getQuery: (
    input: T
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  defaultData?: TData
): Query<TData | undefined, TError> => {
  const [query] = useQueries({
    queries: [...(input === undefined ? [] : [getQuery(input)])],
  }) as UseQueryResult<TData, TError>[]

  if (input === undefined) {
    return {
      data: defaultData,
      error: null,
      isPending: false,
    }
  }

  return query
}
