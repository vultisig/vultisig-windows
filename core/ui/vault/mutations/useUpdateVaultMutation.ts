import { vaultsQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { UpdateVaultFunction } from '../../state/storage/write'
import { UpdateVaultInput } from '../../state/storage/write'
import { useCoreWriteStorage } from '../../state/storage/write'

export const useUpdateVaultMutation = (
  options?: UseMutationOptions<any, any, UpdateVaultInput, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { updateVault } = useCoreWriteStorage()

  const mutationFn: UpdateVaultFunction = async input => {
    const result = await updateVault(input)

    await invalidateQueries(vaultsQueryKey)

    return result
  }

  return useMutation({
    mutationFn,
    ...options,
  })
}
