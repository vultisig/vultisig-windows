import { useMutation } from '@tanstack/react-query'

import { UpdateVaultName } from '../../../wailsjs/go/storage/Store'

export const useRenameVaultMutation = () => {
  return useMutation({
    mutationFn: async ({
      vaultId,
      newName,
    }: {
      vaultId: string
      newName: string
    }) => {
      await UpdateVaultName(vaultId, newName)
    },
  })
}
