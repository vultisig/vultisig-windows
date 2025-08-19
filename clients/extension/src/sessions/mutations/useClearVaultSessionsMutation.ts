import { setVaultsAppSessions } from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useAppSessionsQuery } from '../state/useAppSessions'

type ClearVaultSessionsInput = {
  vaultId: string
}

export const useClearVaultSessionsMutation = (
  options?: UseMutationOptions<any, any, ClearVaultSessionsInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allSessions } = useAppSessionsQuery()

  return useMutation({
    mutationFn: async ({ vaultId }) => {
      const updated = { ...allSessions }
      delete updated[vaultId]
      await setVaultsAppSessions(updated)
    },
    onSuccess: async () => {
      await invalidate([StorageKey.appSessions])
    },
    ...options,
  })
}
