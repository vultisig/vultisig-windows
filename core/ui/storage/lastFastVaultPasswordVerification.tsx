import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { initialLastFastVaultPasswordVerification } from './CoreStorage'
import { StorageKey } from './StorageKey'

export const useLastFastVaultPasswordVerificationQuery = (vaultId: string) => {
  const { getLastFastVaultPasswordVerificationPerVault } = useCore()

  return useQuery({
    queryKey: [StorageKey.lastFastVaultPasswordVerification, vaultId],
    queryFn: () => getLastFastVaultPasswordVerificationPerVault(vaultId),
    ...fixedDataQueryOptions,
  })
}

export const useSetLastFastVaultPasswordVerificationMutation = () => {
  const { setLastFastVaultPasswordVerificationPerVault } = useCore()
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async ({
      vaultId,
      timestamp,
    }: {
      vaultId: string
      timestamp: number
    }) => {
      await setLastFastVaultPasswordVerificationPerVault(vaultId, timestamp)
      await invalidate([StorageKey.lastFastVaultPasswordVerification, vaultId])
    },
  })
}

export { initialLastFastVaultPasswordVerification }
