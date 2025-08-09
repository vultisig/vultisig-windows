import { useQuery } from '@tanstack/react-query'

import { getPersistentState } from './getPersistentState'

export function usePersistentStateQuery<T>(key: string, initialValue: T) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => getPersistentState(key, initialValue),
  })
}
