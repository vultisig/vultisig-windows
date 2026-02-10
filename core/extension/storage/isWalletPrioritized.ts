import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'

const key = 'isPrioritized'
const queryKey = [key]

const setIsWalletPrioritized = async (
  isPrioritized: boolean
): Promise<void> => {
  await setStorageValue<boolean>(key, isPrioritized)
}

export const getIsWalletPrioritized = async (): Promise<boolean> => {
  return getStorageValue<boolean>(key, true)
}

export const useIsWalletPrioritizedQuery = () => {
  return useQuery({
    queryKey: queryKey,
    queryFn: getIsWalletPrioritized,
  })
}

export const useSetIsWalletPrioritizedMutation = (
  options?: UseMutationOptions<any, any, boolean, unknown>
) => {
  const refetch = useRefetchQueries()

  return useMutation({
    mutationFn: async isPrioritized => {
      await setIsWalletPrioritized(isPrioritized)
      return isPrioritized
    },
    onSuccess: async () => {
      await refetch(queryKey)
    },
    ...options,
  })
}
