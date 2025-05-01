import { vaultFoldersQueryKey, vaultsQueryKey } from '@core/ui/query/keys'
import { useVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { getVaultId } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { Entry } from '@lib/utils/entities/Entry'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation } from '@tanstack/react-query'

import { DeleteVaultFolder } from '../../../../wailsjs/go/storage/Store'

export const useDeleteVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  return useMutation({
    mutationFn: async (folderId: string) => {
      const folderVaults = vaults.filter(vault => vault.folderId === folderId)
      const folderlessVaults = vaults.filter(vault => !vault.folderId)

      await DeleteVaultFolder(folderId)

      if (!isEmpty(folderVaults)) {
        const entries: Entry<string, number>[] = []
        folderVaults.forEach(vault => {
          const orders = [
            ...entries.map(entry => entry.value),
            ...folderlessVaults.map(vault => vault.order),
          ]

          const order = getLastItemOrder(orders)

          entries.push({ key: getVaultId(vault), value: order })
        })

        await Promise.all(
          entries.map(({ key, value }) =>
            updateVault({
              vaultId: key,
              fields: { order: value },
            })
          )
        )
      }
    },
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey, vaultsQueryKey)
    },
  })
}
