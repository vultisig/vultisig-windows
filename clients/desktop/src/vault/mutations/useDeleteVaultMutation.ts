import { vaultsQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { DeleteVault } from '../../../wailsjs/go/storage/Store'

export const useDeleteVaultMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (publicKeyEcdsa: string) => {
      await DeleteVault(publicKeyEcdsa)
      await invalidateQueries(vaultsQueryKey)
    },
  })
}
