import { vaultsQueryKey } from '@core/ui/query/keys'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useVaults } from '@core/ui/vault/state/vaults'
import { Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

type AddVaultToFolderInput = {
  vaultId: string
  folderId: string
}

export const useAddVaultToFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  return useMutation({
    mutationFn: async ({ vaultId, folderId }: AddVaultToFolderInput) => {
      const folderVaults = vaults.filter(vault => vault.folderId === folderId)

      const updateParams: Partial<Vault> = {
        folderId,
      }

      if (!isEmpty(folderVaults)) {
        const order = getLastItemOrder(folderVaults.map(({ order }) => order))
        updateParams.order = order
      }

      await updateVault({
        vaultId,
        fields: updateParams,
      })
    },
    onSuccess: () => {
      invalidateQueries(vaultsQueryKey)
    },
  })
}
