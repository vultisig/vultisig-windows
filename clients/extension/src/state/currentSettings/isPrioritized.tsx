import { getPersistentState } from '@clients/extension/src/state/persistent/getPersistentState'
import { setPersistentState } from '@clients/extension/src/state/persistent/setPersistentState'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'

const isPrioritizedQueryKey = ['isPrioritized']
const [key] = isPrioritizedQueryKey

const setPrioritizeWallet = async (isPrioritized: boolean): Promise<void> => {
  await setPersistentState<boolean>(key, isPrioritized)
}

export const getPrioritizeWallet = async (): Promise<boolean> => {
  return getPersistentState<boolean>(key, true)
}

export const useIsPrioritizedWalletQuery = () => {
  return useQuery({
    queryKey: isPrioritizedQueryKey,
    queryFn: getPrioritizeWallet,
  })
}

export const useSetPrioritizeWalletMutation = (
  options?: UseMutationOptions<any, any, boolean, unknown>
) => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async isPrioritized => {
      await setPrioritizeWallet(isPrioritized)
      return isPrioritized
    },
    onSuccess: async () => {
      await invalidate(isPrioritizedQueryKey)
    },
    ...options,
  })
}
