import { useQuery } from '@tanstack/react-query'

export function usePersistentStateQuery<T>(
  queryKey: readonly [string],
  initialValue: T
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const [key] = queryKey
      const result = await chrome.storage.local.get(key)
      const value = result[key]
      if (value === undefined) {
        return initialValue
      }

      return value as T
    },
  })
}
