import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { getPersistentStateQueryKey } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
