import { vaultsQueryKey } from '@core/ui/query/keys'
import { useCore } from '@core/ui/state/core'
import {
  UpdateVaultFunction,
  UpdateVaultInput,
} from '@core/ui/storage/CoreStorage'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

export const useUpdateVaultMutation = (
  options?: UseMutationOptions<any, any, UpdateVaultInput, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { updateVault } = useCore()

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
