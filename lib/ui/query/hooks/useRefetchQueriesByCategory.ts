import { useQueryClient } from '@tanstack/react-query'

import { QueryCategory } from '../utils/options'

/**
 * Returns a function that invalidates every query tagged with the given
 * `meta.category`, regardless of key shape. Lets refresh buttons target a
 * whole class of queries (e.g. every price source) without tracking their
 * individual keys, so new sources can't drift out of sync with the buttons.
 */
export const useRefetchQueriesByCategory = () => {
  const queryClient = useQueryClient()

  return (category: QueryCategory) =>
    queryClient.invalidateQueries({
      predicate: query => query.meta?.category === category,
    })
}
