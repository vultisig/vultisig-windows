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

export const useTransformQueryDataAsync = <TInput, TOutput, TError = unknown>(
  queryResult: Query<TInput, TError>,
  transform: (data: TInput) => Promise<TOutput>
): Query<TOutput, TError | Error> => {
  const initialData = queryResult.data
  const transformQuery = useQuery({
    queryKey: ['transformQueryDataAsync', initialData, transform],
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
    }
  }

  return {
    data: transformQuery.data,
    error: queryResult.error ?? transformQuery.error,
    isPending: queryResult.isPending || transformQuery.isPending,
  }
}
