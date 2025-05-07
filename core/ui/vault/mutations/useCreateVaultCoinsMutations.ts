import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { vaultsCoinsQueryKey } from '../../query/keys'
import { CreateVaultCoinsFunction } from '../../storage/CoreStorage'
export const useCreateVaultCoinsMutation = () => {
  const { createVaultCoins } = useCore()

  const invalidateQueries = useInvalidateQueries()

  const mutationFn: CreateVaultCoinsFunction = async input => {
    await createVaultCoins(input)
    await invalidateQueries(vaultsCoinsQueryKey)
  }

  return useMutation({
    mutationFn,
  })
}
