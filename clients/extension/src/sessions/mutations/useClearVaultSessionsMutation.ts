import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { appSessionsQueryKey, setVaultsAppSessions } from '../state/appSessions'
import {
  currentVaultAppSessionsQueryKey,
  useAppSessionsQuery,
} from '../state/useAppSessions'

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
      await invalidate(currentVaultAppSessionsQueryKey, appSessionsQueryKey)
    },
    ...options,
  })
}
