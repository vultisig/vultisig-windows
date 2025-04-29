import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { vaultsCoinsQueryKey, vaultsQueryKey } from '../../query/keys'
import { useCoreStorage } from '../../state/storage'

export const useCreateVaultCoinsMutation = () => {
  const { createVaultCoins } = useCoreStorage()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: createVaultCoins,
    onSuccess: () => {
      invalidateQueries(vaultsCoinsQueryKey, vaultsQueryKey)
    },
  })
}
