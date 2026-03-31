import { useVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'

import { StorageKey } from '../../../storage/StorageKey'

type RemoveVaultFromFolderInput = {
  vaultId: string
}

export const useRemoveVaultFromFolderMutation = () => {
  const refetchQueries = useRefetchQueries()

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

      await refetchQueries([StorageKey.vaults])
    },
  })
}
