import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../wailsjs/go/models'
import { UpdateVaultName } from '../../../wailsjs/go/storage/Store'
import { getStorageVaultId } from '../utils/storageVault'

export const useRenameVaultMutation = () => {
  return useMutation({
    mutationFn: async ({
      vault,
      newName,
    }: {
      vault: storage.Vault
      newName: string
    }) => {
      await UpdateVaultName(getStorageVaultId(vault), newName)
    },
  })
}
