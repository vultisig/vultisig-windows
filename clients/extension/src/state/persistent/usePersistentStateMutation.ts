import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setPersistentState } from './setPersistentState'

export function usePersistentStateMutation<T>(key: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (value: T) => setPersistentState(key, value),
    onSuccess: data => {
      queryClient.setQueryData([key], data)
    },
  })
}
