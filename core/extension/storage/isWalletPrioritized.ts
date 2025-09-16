import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
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
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async isPrioritized => {
      await setIsWalletPrioritized(isPrioritized)
      return isPrioritized
    },
    onSuccess: async () => {
      await invalidate(queryKey)
    },
    ...options,
  })
}
