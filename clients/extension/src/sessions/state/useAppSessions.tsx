import {
  AppSession,
  appSessionsQueryKey,
  getVaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useQuery } from '@tanstack/react-query'

export const currentVaultAppSessionsQueryKey = ['currentVaultAppSessions']

export const useAppSessionsQuery = () => {
  return useQuery({
    queryKey: appSessionsQueryKey,
    queryFn: getVaultsAppSessions,
    initialData: {},
  })
}

export const useCurrentVaultAppSessionsQuery = () => {
  const vaultId = useAssertCurrentVaultId()
  return useQuery({
    queryKey: currentVaultAppSessionsQueryKey,
    queryFn: async (): Promise<Record<string, AppSession>> => {
      const sessions = await getVaultsAppSessions()
      return vaultId ? (sessions[vaultId] ?? {}) : {}
    },
  })
}
