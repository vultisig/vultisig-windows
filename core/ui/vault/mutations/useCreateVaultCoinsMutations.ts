import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { vaultsCoinsQueryKey } from '../../query/keys'

export const useCreateVaultCoinsMutation = () => {
  const { createVaultCoins } = useCore()

  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: createVaultCoins,
    onSuccess: () => {
      invalidateQueries(vaultsCoinsQueryKey)
    },
  })
}
