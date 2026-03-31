import { useVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'

import { StorageKey } from '../../../storage/StorageKey'

type AddVaultToFolderInput = {
  vaultId: string
  folderId: string
}

export const useAddVaultToFolderMutation = () => {
  const refetchQueries = useRefetchQueries()

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

      await refetchQueries([StorageKey.vaults])
    },
  })
}
