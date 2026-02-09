import { isEmpty } from '@lib/utils/array/isEmpty'
import { without } from '@lib/utils/array/without'
import { attempt } from '@lib/utils/attempt'
import { useMemo } from 'react'

import { EagerQuery, Query } from '../Query'

type MinimalQuery<T, E = unknown> = {
  data: T | undefined
  isPending: boolean
  error?: E | null
}

// Array-based input types
type ArrayInput<T, R, E> = {
  queries: MinimalQuery<T, E>[]
  joinData: (items: T[]) => R
  eager?: boolean
}

// Record-based input types
type QueriesRecord = Record<string, MinimalQuery<unknown>>

type ResolvedRecordData<Q extends QueriesRecord> = {
  [K in keyof Q]?: Q[K]['data'] extends infer D
    ? D extends undefined
      ? never
      : NonNullable<D>
    : never
}

type RecordInput<Q extends QueriesRecord, R> = {
  queries: Q
  joinData: (data: ResolvedRecordData<Q>) => R
  eager?: boolean
}

// OVERLOADS

// 1. Array input, eager (default)
export function useCombineQueries<T, R, E = unknown>(input: {
  queries: MinimalQuery<T, E>[]
  joinData: (items: T[]) => R
  eager?: true
}): EagerQuery<R, E>

// 2. Array input, non-eager
export function useCombineQueries<T, R, E = unknown>(input: {
  queries: MinimalQuery<T, E>[]
  joinData: (items: T[]) => R
  eager: false
}): Query<R, E>

// 3. Record input, eager (default)
export function useCombineQueries<
  Q extends QueriesRecord,
  R,
  E = unknown,
>(input: {
  queries: Q
  joinData: (data: ResolvedRecordData<Q>) => R
  eager?: true
}): EagerQuery<R, E>

// 4. Record input, non-eager
export function useCombineQueries<
  Q extends QueriesRecord,
  R,
  E = unknown,
>(input: {
  queries: Q
  joinData: (data: { [K in keyof Q]: NonNullable<Q[K]['data']> }) => R
  eager: false
}): Query<R, E>

// 5. Array input, dynamic eager boolean
export function useCombineQueries<T, R, E = unknown>(input: {
  queries: MinimalQuery<T, E>[]
  joinData: (items: T[]) => R
  eager: boolean
}): EagerQuery<R, E> | Query<R, E>

// IMPLEMENTATION
export function useCombineQueries<T, R, E = unknown>({
  queries,
  joinData,
  eager = true,
}: ArrayInput<T, R, E> | RecordInput<QueriesRecord, R>) {
  return useMemo(() => {
    const isRecord = !Array.isArray(queries)

    if (isRecord) {
      return handleRecordQueries(
        queries as QueriesRecord,
        joinData as (data: Record<string, unknown>) => R,
        eager
      )
    }

    return handleArrayQueries(
      queries as MinimalQuery<T, E>[],
      joinData as (items: T[]) => R,
      eager
    )
  }, [eager, joinData, queries])
}

const handleRecordQueries = <R, E>(
  queries: QueriesRecord,
  joinData: (data: Record<string, unknown>) => R,
  eager: boolean
): EagerQuery<R, E> | Query<R, E> => {
  const entries = Object.entries(queries)
  const isPending = entries.some(([, q]) => q.isPending)
  const errors: E[] = entries
    .map(([, q]) => q.error)
    .filter((e): e is E => e !== null && e !== undefined)

  const resolvedData: Record<string, unknown> = {}
  for (const [key, query] of entries) {
    if (query.data !== undefined) {
      resolvedData[key] = query.data
    }
  }

  if (eager) {
    if (Object.keys(resolvedData).length === 0) {
      return { isPending, errors, data: undefined }
    }

    const result = attempt<R, E>(() => joinData(resolvedData))
    if (result.data !== undefined) {
      return {
        isPending,
        errors,
        data: result.data,
      }
    }
    const allErrors: E[] = [...errors, result.error as E]
    return {
      isPending,
      errors: allErrors,
      data: undefined,
    }
  }

  // Non-eager: wait for all
  const allResolved = entries.every(([, q]) => q.data !== undefined)
  const queryError = errors[0] as E | undefined

  if (!allResolved) {
    return { isPending, error: queryError ?? null, data: undefined } as Query<
      R,
      E
    >
  }

  const result = attempt<R, E>(() => joinData(resolvedData))
  if (result.data !== undefined) {
    return {
      isPending,
      error: queryError ?? null,
      data: result.data,
    } as Query<R, E>
  }
  return {
    isPending,
    error: queryError ?? (result.error as E),
    data: undefined,
  } as Query<R, E>
}

const handleArrayQueries = <T, R, E>(
  queries: MinimalQuery<T, E>[],
  joinData: (items: T[]) => R,
  eager: boolean
): EagerQuery<R, E> | Query<R, E> => {
  const isPending = queries.some(query => query.isPending)
  const errors: E[] = queries
    .map(query => query.error)
    .filter((e): e is E => e !== null && e !== undefined)

  if (eager) {
    if (isEmpty(queries)) {
      const result = attempt<R, E>(() => joinData([]))
      if (result.data !== undefined) {
        return {
          isPending,
          errors,
          data: result.data,
        }
      }
      const allErrors: E[] = [...errors, result.error as E]
      return {
        isPending,
        errors: allErrors,
        data: undefined,
      }
    }

    const resolvedQueries = without(
      queries.map(query => query.data),
      undefined
    )

    if (isEmpty(resolvedQueries)) {
      return { isPending, errors, data: undefined }
    }

    const result = attempt<R, E>(() => joinData(resolvedQueries as T[]))
    if (result.data !== undefined) {
      return {
        isPending,
        errors,
        data: result.data,
      }
    }
    const allErrors: E[] = [...errors, result.error as E]
    return {
      isPending,
      errors: allErrors,
      data: undefined,
    }
  }

  // Non-eager array mode
  const queryError = errors[0] as E | undefined

  if (isEmpty(queries)) {
    const result = attempt<R, E>(() => joinData([]))
    if (result.data !== undefined) {
      return {
        isPending,
        error: null,
        data: result.data,
      } as Query<R, E>
    }
    return {
      isPending,
      error: result.error as E,
      data: undefined,
    } as Query<R, E>
  }

  const values = queries.map(q => q.data)
  const allResolved = values.every(v => v !== undefined)

  if (!allResolved) {
    return { isPending, error: queryError ?? null, data: undefined } as Query<
      R,
      E
    >
  }

  const result = attempt<R, E>(() => joinData(values as T[]))
  if (result.data !== undefined) {
    return {
      isPending,
      error: queryError ?? null,
      data: result.data,
    } as Query<R, E>
  }
  return {
    isPending,
    error: queryError ?? (result.error as E),
    data: undefined,
  } as Query<R, E>
}
