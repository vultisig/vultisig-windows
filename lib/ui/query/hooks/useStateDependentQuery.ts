import {
  useQueries,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { areEqualRecords } from '@vultisig/lib-utils/record/areEqualRecords'
import { withoutUndefinedFields } from '@vultisig/lib-utils/record/withoutUndefinedFields'
import { WithoutUndefinedFields } from '@vultisig/lib-utils/types/WithoutUndefinedFields'

import { inactiveQuery, Query } from '../Query'

export const useStateDependentQuery = <
  T extends Record<string, any>,
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  state: T,
  getQuery: (
    state: WithoutUndefinedFields<T>
  ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): Query<TData, TError> => {
  const presentState = withoutUndefinedFields(state)

  const [query] = useQueries({
    queries: [
      ...(areEqualRecords(state, presentState) ? [getQuery(presentState)] : []),
    ],
  }) as UseQueryResult<TData, TError>[]

  return query ?? inactiveQuery
}
