import { useVaults } from '@core/ui/vault/state/vaults'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

import {
  UpdateVaultFolderID,
  UpdateVaultOrder,
} from '../../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../../../vault/queries/useVaultsQuery'

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

      await UpdateVaultFolderID(vaultId, folderId)

      if (!isEmpty(folderVaults)) {
        const order = getLastItemOrder(folderVaults.map(({ order }) => order))

        await UpdateVaultOrder(vaultId, order)
      }
    },
    onSuccess: () => {
      invalidateQueries(vaultsQueryKey)
    },
  })
}
