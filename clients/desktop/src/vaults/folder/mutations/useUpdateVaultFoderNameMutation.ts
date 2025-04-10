import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { UpdateVaultFolderName } from '../../../../wailsjs/go/storage/Store'
import { vaultFoldersQueryKey } from '../../folders/queries/useVaultFoldersQuery'

export const useUpdateVaultFolderNameMutation = () => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      await UpdateVaultFolderName(id, name),
    onSuccess: () => invalidate(vaultFoldersQueryKey),
  })
}
