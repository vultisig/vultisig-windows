import { useMutation } from '@tanstack/react-query'

import { UpdateVault } from '../../../wailsjs/go/storage/Store'

export const useRenameVaultMutation = () => {
  return useMutation({
    mutationFn: async ({
      vaultId,
      newName,
    }: {
      vaultId: string
      newName: string
    }) => {
      await UpdateVault(vaultId, { name: newName })
    },
  })
}
