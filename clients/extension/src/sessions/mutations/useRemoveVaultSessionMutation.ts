import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { appSessionsQueryKey, setVaultsAppSessions } from '../state/appSessions'
import {
  currentVaultAppSessionsQueryKey,
  useAppSessionsQuery,
} from '../state/useAppSessions'

type RemoveVaultSessionInput = {
  vaultId: string
  host: string
}

export const useRemoveVaultSessionMutation = (
  options?: UseMutationOptions<any, any, RemoveVaultSessionInput, unknown>
) => {
  const invalidate = useInvalidateQueries()

  const { data: allSessions } = useAppSessionsQuery()
  return useMutation({
    mutationFn: async ({ vaultId, host }) => {
      const vaultSessions = { ...(allSessions[vaultId] || {}) }
      delete vaultSessions[host]

      const updatedAll = {
        ...allSessions,
        [vaultId]: vaultSessions,
      }

      await setVaultsAppSessions(updatedAll)
      return vaultSessions
    },
    onSuccess: async () => {
      await invalidate(currentVaultAppSessionsQueryKey, appSessionsQueryKey)
    },
    ...options,
  })
}
