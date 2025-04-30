import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { Entry } from '@lib/utils/entities/Entry'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { vaultFoldersQueryKey, vaultsQueryKey } from '../query/keys'
import { useCoreStorage } from '../state/storage'
import { useUpdateVaultMutation } from '../vault/mutations/useUpdateVaultMutation'
import { getVaultId } from '../vault/Vault'
import { useVaults } from './vaults'

export const useVaultFoldersQuery = () => {
  const { getVaultFolders } = useCoreStorage()

  return useQuery({
    queryKey: vaultFoldersQueryKey,
    queryFn: async () => {
      const result = await getVaultFolders()

      return sortEntitiesWithOrder(result)
    },
  })
}

export const useVaultFolders = () => {
  const { data } = useVaultFoldersQuery()

  return shouldBePresent(data)
}

export const useVaultFolder = (id: string) => {
  const folders = useVaultFolders()

  return useMemo(() => folders.find(folder => folder.id === id), [folders, id])
}

export const useDeleteVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const vaults = useVaults()

  const { deleteVaultFolder } = useCoreStorage()

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  return useMutation({
    mutationFn: async (folderId: string) => {
      const folderVaults = vaults.filter(vault => vault.folderId === folderId)
      const folderlessVaults = vaults.filter(vault => !vault.folderId)

      await deleteVaultFolder(folderId)

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
