import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation, useQuery } from '@tanstack/react-query'

const key = 'isSidePanelEnabled'
const queryKey = [key]

const setIsSidePanelEnabled = async (
  isSidePanelEnabled: boolean
): Promise<void> => {
  await setStorageValue<boolean>(key, isSidePanelEnabled)
}

export const getIsSidePanelEnabled = async (): Promise<boolean> => {
  return getStorageValue<boolean>(key, false)
}

export const useIsSidePanelEnabledQuery = () => {
  return useQuery({
    queryKey,
    queryFn: getIsSidePanelEnabled,
  })
}

export const useSetIsSidePanelEnabledMutation = () => {
  const refetch = useRefetchQueries()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      await setIsSidePanelEnabled(enabled)
      return enabled
    },
    onSuccess: async () => {
      await refetch(queryKey)
    },
  })
}
