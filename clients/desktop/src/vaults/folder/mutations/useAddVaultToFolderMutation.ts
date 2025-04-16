import { vaultsQueryKey } from '@core/ui/query/keys'
import { useVaults } from '@core/ui/vault/state/vaults'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

import { UpdateVault } from '../../../../wailsjs/go/storage/Store'

type AddVaultToFolderInput = {
  vaultId: string
  folderId: string
}

export const useAddVaultToFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  return useMutation({
    mutationFn: async ({ vaultId, folderId }: AddVaultToFolderInput) => {
      const folderVaults = vaults.filter(vault => vault.folderId === folderId)

      const updateParams: any = {
        folderId,
      }

      if (!isEmpty(folderVaults)) {
        const order = getLastItemOrder(folderVaults.map(({ order }) => order))
        updateParams.order = order
      }

      await UpdateVault(vaultId, updateParams)
    },
    onSuccess: () => {
      invalidateQueries(vaultsQueryKey)
    },
  })
}
