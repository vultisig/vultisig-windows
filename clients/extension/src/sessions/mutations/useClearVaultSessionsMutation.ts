import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useExtensionStorage } from '../../state/extensionStorage'
import { appSessionsQueryKey } from '../state/appSessions'
import { useAppSessions } from '../state/useAppSessions'

type ClearVaultSessionsInput = {
  vaultId: string
}

export const useClearVaultSessionsMutation = (
  options?: UseMutationOptions<any, any, ClearVaultSessionsInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const allSessions = useAppSessions()
  const { setVaultsAppSessions } = useExtensionStorage()

  return useMutation({
    mutationFn: async ({ vaultId }) => {
      const updated = { ...allSessions }
      delete updated[vaultId]
      await setVaultsAppSessions(updated)
    },
    onSuccess: async (_result, { vaultId }) => {
      await invalidate([appSessionsQueryKey, vaultId])
    },
    ...options,
  })
}
