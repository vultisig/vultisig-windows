import { vaultsQueryKey } from '@core/ui/query/keys'
import { useVaults } from '@core/ui/vault/state/vaults'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

import {
  UpdateVaultFolderID,
  UpdateVaultOrder,
} from '../../../../wailsjs/go/storage/Store'

type RemoveVaultFromFolderInput = {
  vaultId: string
}

export const useRemoveVaultFromFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  return useMutation({
    mutationFn: async ({ vaultId }: RemoveVaultFromFolderInput) => {
      const folderlessVaults = vaults.filter(vault => !vault.folderId)

      await UpdateVaultFolderID(vaultId, null)

      if (!isEmpty(folderlessVaults)) {
        const order = getLastItemOrder(
          folderlessVaults.map(({ order }) => order)
        )

        await UpdateVaultOrder(vaultId, order)
      }
    },
    onSuccess: () => {
      invalidateQueries(vaultsQueryKey)
    },
  })
}
