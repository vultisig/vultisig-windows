import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useExtensionStorage } from '../../state/extensionStorage'
import { appSessionsQueryKey } from '../state/appSessions'
import { useAppSessions } from '../state/useAppSessions'

type RemoveVaultSessionInput = {
  vaultId: string
  host: string
}

export const useRemoveVaultSessionMutation = (
  options?: UseMutationOptions<any, any, RemoveVaultSessionInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const allSessions = useAppSessions()
  const { setVaultsAppSessions } = useExtensionStorage()

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
      await invalidate([appSessionsQueryKey])
    },
    ...options,
  })
}
