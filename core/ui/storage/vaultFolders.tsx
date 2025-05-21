import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { Entry } from '@lib/utils/entities/Entry'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useUpdateVaultMutation } from '../vault/mutations/useUpdateVaultMutation'
import { getVaultId } from '../vault/Vault'
import { UpdateVaultFolderFunction } from './CoreStorage'
import { StorageKey } from './StorageKey'
import { useVaults } from './vaults'

export const useVaultFoldersQuery = () => {
  const { getVaultFolders } = useCore()

  return useQuery({
    queryKey: [StorageKey.vaultFolders],
    queryFn: async () => {
      const result = await getVaultFolders()

      return sortEntitiesWithOrder(result)
    },
    ...fixedDataQueryOptions,
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

  const { deleteVaultFolder } = useCore()

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

      await invalidateQueries([StorageKey.vaultFolders], [StorageKey.vaults])
    },
  })
}

export const useUpdateVaultFolderMutation = () => {
  const { updateVaultFolder } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: UpdateVaultFolderFunction = async input => {
    await updateVaultFolder(input)
    await invalidateQueries([StorageKey.vaultFolders])
  }

  return useMutation({
    mutationFn,
  })
}

type CreateVaultFolderInput = {
  name: string
  order: number
  vaultIds: string[]
}

export const useCreateVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const { createVaultFolder, updateVault } = useCore()

  return useMutation({
    mutationFn: async ({ name, order, vaultIds }: CreateVaultFolderInput) => {
      const folder = {
        name,
        order,
        id: uuidv4(),
        vaultIds,
      }

      await createVaultFolder(folder)

      await Promise.all(
        vaultIds.map(vaultId =>
          updateVault({
            vaultId,
            fields: { folderId: folder.id },
          })
        )
      )

      await invalidateQueries([StorageKey.vaultFolders], [StorageKey.vaults])
    },
  })
}
