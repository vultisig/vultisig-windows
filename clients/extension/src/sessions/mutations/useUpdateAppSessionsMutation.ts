import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  AppSession,
  appSessionsQueryKey,
  useVaultsAppSessionsMutation,
  useVaultsAppSessionsQuery,
} from '../state/appSessions'

type UpdateAppSessionFieldsInput = {
  vaultId: string
  host: string
  fields: Partial<AppSession>
}

export const useUpdateAppSessionMutation = (
  options?: UseMutationOptions<any, any, UpdateAppSessionFieldsInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allSessions = {} } = useVaultsAppSessionsQuery()
  const { mutateAsync: setAllSessions } = useVaultsAppSessionsMutation()

  return useMutation({
    mutationFn: async ({ vaultId, host, fields }) => {
      const vaultSessions = allSessions[vaultId] ?? {}
      const existing = vaultSessions[host]

      if (!existing) {
        throw new Error(`No session found for host: ${host}`)
      }

      const updatedSession = { ...existing, ...fields }
      const updatedVaultSessions = {
        ...vaultSessions,
        [host]: updatedSession,
      }

      const updatedAll = {
        ...allSessions,
        [vaultId]: updatedVaultSessions,
      }

      await setAllSessions(updatedAll)
      return updatedSession
    },
    onSuccess: async (_result, { vaultId }) => {
      await invalidate([appSessionsQueryKey, vaultId])
    },
    ...options,
  })
}
