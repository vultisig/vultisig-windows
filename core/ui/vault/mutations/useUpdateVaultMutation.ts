import { vaultsQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import {
  UpdateVaultFunction,
  UpdateVaultInput,
  useUpdateVault,
} from '../state/updateVault'

export const useUpdateVaultMutation = (
  options?: UseMutationOptions<any, any, UpdateVaultInput, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const updateVault = useUpdateVault()

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
