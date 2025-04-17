import { vaultsQueryKey } from '@core/ui/query/keys'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useVaults } from '@core/ui/vault/state/vaults'
import { Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

type RemoveVaultFromFolderInput = {
  vaultId: string
}

export const useRemoveVaultFromFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  return useMutation({
    mutationFn: async ({ vaultId }: RemoveVaultFromFolderInput) => {
      const folderlessVaults = vaults.filter(vault => !vault.folderId)

      const updateParams: Partial<Vault> = {
        folderId: undefined,
      }

      if (!isEmpty(folderlessVaults)) {
        const order = getLastItemOrder(
          folderlessVaults.map(({ order }) => order)
        )
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
