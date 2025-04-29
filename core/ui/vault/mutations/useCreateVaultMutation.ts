import { vaultsQueryKey } from '@core/ui/query/keys'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useCoreWriteStorage } from '../../state/storage/write'
import { useSetCurrentVaultIdMutation } from './useSetCurrentVaultIdMutation'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { createVault } = useCoreWriteStorage()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  return useMutation({
    mutationFn: async (vault: Vault) => {
      const result = await createVault(vault)

      await invalidateQueries(vaultsQueryKey)

      await setCurrentVaultId(getVaultId(result))

      return result
    },
    ...options,
  })
}
