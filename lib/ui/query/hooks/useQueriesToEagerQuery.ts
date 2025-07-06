import { isEmpty } from '@lib/utils/array/isEmpty'
import { without } from '@lib/utils/array/without'
import { useMemo } from 'react'

import { EagerQuery, Query } from '../Query'

type ToEagerQueryInput<T, R, E = unknown> = {
  queries: Query<T, E>[]
  joinData: (items: T[]) => R
}

export function useQueriesToEagerQuery<T, R, E = unknown>({
  queries,
  joinData,
}: ToEagerQueryInput<T, R, E>): EagerQuery<R, E> {
  return useMemo(() => {
    const isPending = queries.some(query => query.isPending)
    const errors = queries.flatMap(query => query.error ?? [])

    if (isEmpty(queries)) {
      return {
        isPending,
        errors,
        data: joinData([]),
      }
    }

    try {
      const resolvedQueries = without(
        queries.map(query => query.data),
        undefined
      )
      return {
        isPending,
        errors,
        data: isEmpty(resolvedQueries) ? undefined : joinData(resolvedQueries),
      }
    } catch (error: any) {
      return {
        isPending,
        errors: [...errors, error],
        data: undefined,
      }
    }
  }, [joinData, queries])
}
