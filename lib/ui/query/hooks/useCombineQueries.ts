import { isEmpty } from '@lib/utils/array/isEmpty'
import { without } from '@lib/utils/array/without'
import { attempt } from '@lib/utils/attempt'
import { useMemo } from 'react'

import { EagerQuery, Query } from '../Query'

type MinimalQuery<T, E> = {
  data: T | undefined
  isPending: boolean
  error?: E | null
}

type BaseInput<T, R, E> = {
  queries: MinimalQuery<T, E>[]
  joinData: (items: T[]) => R
}

type EagerInput<T, R, E> = BaseInput<T, R, E> & { eager?: true }
type NonEagerInput<T, R, E> = BaseInput<T, R, E> & { eager: false }

export function useCombineQueries<T, R, E = unknown>(
  input: EagerInput<T, R, E>
): EagerQuery<R, E>
export function useCombineQueries<T, R, E = unknown>(
  input: NonEagerInput<T, R, E>
): Query<R, E>
export function useCombineQueries<T, R, E = unknown>(
  input: BaseInput<T, R, E> & { eager: boolean }
): EagerQuery<R, E> | Query<R, E>
export function useCombineQueries<T, R, E = unknown>({
  queries,
  joinData,
  eager = true,
}:
  | EagerInput<T, R, E>
  | NonEagerInput<T, R, E>
  | (BaseInput<T, R, E> & { eager: boolean })) {
  return useMemo(() => {
    const isPending = queries.some(query => query.isPending)

    if (eager) {
      const errors = queries.flatMap(query =>
        query.error ? [query.error] : []
      )

      if (isEmpty(queries)) {
        const { data, error } = attempt<R, E>(() => joinData([]))
        return {
          isPending,
          errors: error ? [...errors, error] : errors,
          data,
        }
      }

      const resolvedQueries = without(
        queries.map(query => query.data),
        undefined
      )

      if (isEmpty(resolvedQueries)) {
        return {
          isPending,
          errors,
          data: undefined,
        }
      }

      const { data, error } = attempt<R, E>(() =>
        joinData(resolvedQueries as T[])
      )
      return {
        isPending,
        errors: error ? [...errors, error] : errors,
        data,
      }
    }

    if (isEmpty(queries)) {
      const { data, error } = attempt<R, E>(() => joinData([]))
      return {
        isPending,
        error: error ?? null,
        data,
      } as Query<R, E>
    }

    const [queryError] = without(
      queries.map(q => q.error),
      undefined,
      null
    )

    const values = queries.map(q => q.data)
    const allResolved = values.every(v => v !== undefined)

    if (!allResolved) {
      return {
        isPending,
        error: queryError,
        data: undefined,
      } as Query<R, E>
    }

    const { data, error } = attempt<R, E>(() => joinData(values as T[]))
    return {
      isPending,
      error: queryError ?? error ?? null,
      data,
    } as Query<R, E>
  }, [eager, joinData, queries])
}
