import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useExtensionStorage } from '../../state/extensionStorage'
import { appSessionsQueryKey } from '../state/appSessions'
import { AppSession } from '../state/appSessions'
import { useAppSessions } from '../state/useAppSessions'

type AddVaultSessionInput = {
  vaultId: string
  session: AppSession
}

export const useAddVaultSessionMutation = (
  options?: UseMutationOptions<any, any, AddVaultSessionInput, unknown>
) => {
  const allSessions = useAppSessions()
  const invalidate = useInvalidateQueries()
  const { setVaultsAppSessions } = useExtensionStorage()

  return useMutation({
    mutationFn: async ({ vaultId, session }) => {
      const vaultSessions = allSessions[vaultId] ?? {}
      const updatedVaultSessions = { ...vaultSessions, [session.host]: session }
      const updatedAll = { ...allSessions, [vaultId]: updatedVaultSessions }
      await setVaultsAppSessions(updatedAll)
      return updatedVaultSessions
    },
    onSuccess: async () => {
      await invalidate([appSessionsQueryKey])
    },
    ...options,
  })
}
