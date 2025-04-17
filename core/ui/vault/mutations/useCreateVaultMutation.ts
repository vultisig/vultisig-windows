import { vaultsQueryKey } from '@core/ui/query/keys'
import { useCreateVault } from '@core/ui/vault/state/createVault'
import { useSetCurrentVaultId } from '@core/ui/vault/state/setCurrentVaultId'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const createVault = useCreateVault()

  const setCurrentVaultId = useSetCurrentVaultId()

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
