import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { DeleteVault } from '../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../queries/useVaultsQuery'

export const useDeleteVaultMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (publicKeyEcdsa: string) => {
      await DeleteVault(publicKeyEcdsa)
      await invalidateQueries(vaultsQueryKey)
    },
  })
}
