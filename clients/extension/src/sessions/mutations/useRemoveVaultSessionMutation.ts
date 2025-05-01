import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { appSessionsQueryKey, useVaultsAppSessionsMutation, useVaultsAppSessionsQuery } from '../state/appSessions'

type RemoveVaultSessionInput = {
  vaultId: string
  host: string
}

export const useRemoveVaultSessionMutation = (
  options?: UseMutationOptions<any, any, RemoveVaultSessionInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allSessions = {} } = useVaultsAppSessionsQuery()
  const { mutateAsync: setAllSessions } = useVaultsAppSessionsMutation()

  return useMutation({
    mutationFn: async ({ vaultId, host }) => {
      const vaultSessions = { ...allSessions[vaultId] }
      delete vaultSessions[host]

      const updatedAll = {
        ...allSessions,
        [vaultId]: vaultSessions,
      }

      await setAllSessions(updatedAll)
      return vaultSessions
    },
    onSuccess: async (_result, { vaultId }) => {
      await invalidate([appSessionsQueryKey, vaultId])
    },
    ...options,
  })
}
