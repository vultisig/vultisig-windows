import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { useQuery } from '@tanstack/react-query'

export const getPersistentStateQueryKey = (key: PersistentStateKey) => [
  'persistentState',
  key,
]

export function usePersistentStateQuery<T>(
  key: PersistentStateKey,
  initialValue: T
) {
  return useQuery({
    queryKey: getPersistentStateQueryKey(key),
    queryFn: async () => {
      const result = await chrome.storage.local.get(key)
      const value = result[key]
      if (value === undefined) {
        return initialValue
      }

      return value as T
    },
  })
}
