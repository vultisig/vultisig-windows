import {
  useQueries,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

import { inactiveQuery, Query } from '../Query'

export const useQueriesDependentQuery = <
  TDeps extends any[],
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  depQueries: { [K in keyof TDeps]: Query<TDeps[K], unknown> },
  getQuery: (
    ...deps: TDeps
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): Query<TData, unknown | TError> => {
  const somePending = depQueries.some(q => q.isPending)
  const firstError = depQueries.find(q => q.error !== null)?.error ?? null
  const allHaveData = depQueries.every(q => q.data !== undefined)

  const shouldRunDependent = allHaveData && !somePending && firstError === null

  const depData = depQueries.map(q => q.data) as unknown as TDeps

  const [query] = useQueries({
    queries: [...(shouldRunDependent ? [getQuery(...depData)] : [])],
  }) as UseQueryResult<TData, TError>[]

  if (somePending) {
    return {
      data: undefined,
      error: firstError as unknown as TError | unknown,
      isPending: true,
    }
  }

  if (firstError !== null) {
    return {
      data: undefined,
      error: firstError as unknown as TError | unknown,
      isPending: false,
    }
  }

  if (!shouldRunDependent) {
    return inactiveQuery as Query<TData, unknown | TError>
  }

  return {
    data: query.data,
    error: query.error as unknown as TError | unknown,
    isPending: query.isPending,
  }
}
