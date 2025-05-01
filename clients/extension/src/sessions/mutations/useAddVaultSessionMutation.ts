import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import {
  useVaultsAppSessionsQuery,
  useVaultsAppSessionsMutation,
  appSessionsQueryKey,
} from '../state/appSessions'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { AppSession } from '../state/appSessions'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'

type AddVaultSessionInput = {
  vaultId: string
  session: AppSession
}

export const useAddVaultSessionMutation = (
  options?: UseMutationOptions<any, any, AddVaultSessionInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { data: allSessions = {} } = useVaultsAppSessionsQuery()
  const { mutateAsync: setAllSessions } = useVaultsAppSessionsMutation()

  return useMutation({
    mutationFn: async ({ vaultId, session }) => {
      const vaultSessions = allSessions[vaultId] ?? {}
      const updatedVaultSessions = { ...vaultSessions, [session.host]: session }
      const updatedAll = { ...allSessions, [vaultId]: updatedVaultSessions }

      await setAllSessions(updatedAll)
      await setCurrentVaultId(vaultId)
      return updatedVaultSessions
    },
    onSuccess: async (_result, { vaultId }) => {
      await invalidate([appSessionsQueryKey, vaultId])
    },
    ...options,
  })
}
