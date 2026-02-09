import { Query } from '@lib/ui/query/Query'

import { useCombineQueries } from './useCombineQueries'

const identityFn = <T>(data: T): T => data

export function useMergeQueries<
  T extends Record<string, Query<any, E>>,
  E = unknown,
>(queriesRecord: T): Query<{ [K in keyof T]: NonNullable<T[K]['data']> }, E> {
  return useCombineQueries({
    queries: queriesRecord,
    joinData: identityFn,
    eager: false,
  })
}
