import { useQuery } from '@tanstack/react-query'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useMemo } from 'react'

import { Query } from '../Query'

type QueryBase<T> = Pick<Query<T>, 'data' | 'error'>

export const useTransformQueryData = <
  TInput,
  TOutput,
  TExtra extends object = {},
>(
  queryResult: QueryBase<TInput> & TExtra,
  transform: (data: TInput) => TOutput
): QueryBase<TOutput> & Omit<TExtra, keyof QueryBase<TOutput>> => {
  return useMemo(() => {
    const initialData = queryResult.data
    if (initialData === undefined) {
      return {
        ...queryResult,
        data: undefined,
      }
    }

    const { data, error = null } = attempt<TOutput>(() =>
      transform(initialData)
    )

    return {
      ...queryResult,
      data,
      error,
    }
  }, [queryResult, transform])
}

/**
 * Transforms resolved query data with an async transform.
 *
 * @param queryResult - Source query whose data should be transformed.
 * @param transform - Async function that maps source data to the output value.
 * @param transformKey - Stable key parts that identify this transform.
 * @returns A query carrying transformed data plus source pending/error state.
 */
export const useTransformQueryDataAsync = <TInput, TOutput, TError = unknown>(
  queryResult: Query<TInput, TError>,
  transform: (data: TInput) => Promise<TOutput>,
  transformKey: readonly unknown[]
): Query<TOutput, TError | Error> => {
  const initialData = queryResult.data
  const transformQuery = useQuery({
    queryKey: ['transformQueryDataAsync', transformKey, initialData],
    queryFn: () => {
      if (initialData === undefined) {
        throw new Error('Missing query data')
      }

      return transform(initialData)
    },
    enabled: initialData !== undefined && queryResult.error === null,
  })

  if (initialData === undefined) {
    return {
      data: undefined,
      error: queryResult.error,
      isPending: queryResult.isPending,
      isPlaceholderData: queryResult.isPlaceholderData,
    }
  }

  return {
    data: transformQuery.data,
    error: queryResult.error ?? transformQuery.error,
    isPending: queryResult.isPending || transformQuery.isPending,
    isPlaceholderData:
      transformQuery.isPlaceholderData || queryResult.isPlaceholderData,
  }
}
