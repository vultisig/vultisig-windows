import { useCore } from '@core/ui/state/core'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { StorageKey } from '../../storage/StorageKey'
import { UpdateVaultFunction } from '../../storage/vaults'
import { UpdateVaultInput } from '../../storage/vaults'

export const useUpdateVaultMutation = (
  options?: UseMutationOptions<any, any, UpdateVaultInput, unknown>
) => {
  const refetchQueries = useRefetchQueries()

  const { updateVault } = useCore()

  const mutationFn: UpdateVaultFunction = async input => {
    const result = await updateVault(input)

    await refetchQueries([StorageKey.vaults])

    return result
  }

  return useMutation({
    mutationFn,
    ...options,
  })
}
