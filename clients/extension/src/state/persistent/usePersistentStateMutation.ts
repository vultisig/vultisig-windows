import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PersistentStateKey } from './PersistentStateKey'
import { getPersistentStateQueryKey } from './usePersistentStateQuery'

export function usePersistentStateMutation<T>(key: PersistentStateKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (value: T) => {
      await chrome.storage.local.set({ [key]: value })

      return value
    },
    onSuccess: data => {
      queryClient.setQueryData(getPersistentStateQueryKey(key), data)
    },
  })
}
