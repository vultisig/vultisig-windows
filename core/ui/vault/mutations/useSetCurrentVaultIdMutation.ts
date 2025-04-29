import { currentVaultIdQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useCoreWriteStorage } from '../../state/storage/write'
import { CurrentVaultId } from '../state/currentVaultId'

export const useSetCurrentVaultIdMutation = (
  options?: UseMutationOptions<any, any, CurrentVaultId, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { setCurrentVaultId } = useCoreWriteStorage()

  const mutationFn = async (value: CurrentVaultId) => {
    await setCurrentVaultId(value)

    await invalidateQueries(currentVaultIdQueryKey)
  }

  return useMutation({
    mutationFn,
    ...options,
  })
}
