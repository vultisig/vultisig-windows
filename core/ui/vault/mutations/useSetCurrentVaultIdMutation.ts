import { currentVaultIdQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { CurrentVaultId } from '../state/currentVaultId'
import { useSetCurrentVaultId } from '../state/setCurrentVaultId'

export const useSetCurrentVaultIdMutation = (
  options?: UseMutationOptions<any, any, CurrentVaultId, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const setCurrentVaultId = useSetCurrentVaultId()

  const mutationFn = async (value: CurrentVaultId) => {
    await setCurrentVaultId(value)

    await invalidateQueries(currentVaultIdQueryKey)
  }

  return useMutation({
    mutationFn,
    ...options,
  })
}
