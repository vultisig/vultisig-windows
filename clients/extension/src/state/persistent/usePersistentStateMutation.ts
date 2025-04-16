import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { getPersistentStateQueryKey } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setPersistentState } from './setPersistentState'

export function usePersistentStateMutation<T>(key: PersistentStateKey) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (value: T) => setPersistentState(key, value),
    onSuccess: data => {
      queryClient.setQueryData(getPersistentStateQueryKey(key), data)
    },
  })
}
