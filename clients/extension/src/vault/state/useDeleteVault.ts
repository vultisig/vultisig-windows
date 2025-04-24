import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { useMutation } from '@tanstack/react-query'

export const useDeleteVaultMutation = () => {
  const { mutateAsync: setVaults } = usePersistentStateMutation('vaults')

  return useMutation({
    mutationFn: async (vaultId: string) => {
      const vaults = await getVaults()
      const updatedVaults = vaults.filter(
        vault => getVaultId(vault) !== vaultId
      )
      await setVaults(updatedVaults)
    },
  })
}
