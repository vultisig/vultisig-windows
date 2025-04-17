import { vaultsQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { storage } from '../../../../wailsjs/go/models'
import {
  SaveVaultFolder,
  UpdateVault,
} from '../../../../wailsjs/go/storage/Store'
import { vaultFoldersQueryKey } from '../../folders/queries/useVaultFoldersQuery'

type CreateVaultFolderInput = {
  name: string
  order: number
  vaultIds: string[]
}

export const useCreateVaultFolderMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({ name, order, vaultIds }: CreateVaultFolderInput) => {
      const folder = storage.VaultFolder.createFrom({
        name,
        order,
        id: uuidv4(),
      })

      await SaveVaultFolder(folder)

      await Promise.all(
        vaultIds.map(vaultId => UpdateVault(vaultId, { folderId: folder.id }))
      )
    },
    onSuccess: () => {
      invalidateQueries(vaultFoldersQueryKey, vaultsQueryKey)
    },
  })
}
