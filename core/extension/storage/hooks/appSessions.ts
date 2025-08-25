import {
  addVaultAppSession,
  getVaultsAppSessions,
  removeAllVaultAppSessions,
  removeVaultAppSession,
  VaultAppSession,
  VaultAppSessionKey,
} from '@core/extension/storage/appSessions'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { OnSuccessProp } from '@lib/ui/props'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useMutation, useQuery } from '@tanstack/react-query'

const queryKey = [StorageKey.appSessions]

const useAppSessionsQuery = () => {
  return useQuery({
    queryKey,
    queryFn: getVaultsAppSessions,
  })
}

export const useCurrentVaultAppSessionsQuery = () => {
  const vaultId = useAssertCurrentVaultId()

  return useTransformQueryData(
    useAppSessionsQuery(),
    data => data[vaultId] ?? {}
  )
}

export const useAddVaultAppSessionMutation = (
  options: Partial<OnSuccessProp<VaultAppSession>> = {}
) => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async (session: VaultAppSession) => {
      await addVaultAppSession(session)
      await invalidate(queryKey)

      return session
    },
    ...options,
  })
}

export const useRemoveVaultAppSessionMutation = () => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async (session: VaultAppSessionKey) => {
      await removeVaultAppSession(session)
      await invalidate(queryKey)
    },
  })
}

export const useRemoveAllVaultAppSessionsMutation = () => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async (vaultId: string) => {
      await removeAllVaultAppSessions(vaultId)
      await invalidate(queryKey)
    },
  })
}
