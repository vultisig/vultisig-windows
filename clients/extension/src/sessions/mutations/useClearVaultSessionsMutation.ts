import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { UseMutationOptions, useMutation } from '@tanstack/react-query'
import {
  appSessionsQueryKey,
  useVaultsAppSessionsMutation,
  useVaultsAppSessionsQuery,
} from '../state/appSessions'

type ClearVaultSessionsInput = {
  vaultId: string
}

export const useClearVaultSessionsMutation = (
  options?: UseMutationOptions<any, any, ClearVaultSessionsInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allSessions = {} } = useVaultsAppSessionsQuery()
  const { mutateAsync: setAllSessions } = useVaultsAppSessionsMutation()

  return useMutation({
    mutationFn: async ({ vaultId }) => {
      const updated = { ...allSessions }
      delete updated[vaultId]
      await setAllSessions(updated)
    },
    onSuccess: async (_result, { vaultId }) => {
      await invalidate([appSessionsQueryKey, vaultId])
    },
    ...options,
  })
}
