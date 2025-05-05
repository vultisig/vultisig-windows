import { useQuery } from '@tanstack/react-query'

import { getCurrentVaultId } from '../../vault/state/currentVaultId'
import {
  AppSession,
  appSessionsQueryKey,
  getVaultsAppSessions,
} from './appSessions'

export const currentVaultAppSessionsQueryKey = ['currentVaultAppSessions']

export const useAppSessionsQuery = () => {
  return useQuery({
    queryKey: appSessionsQueryKey,
    queryFn: getVaultsAppSessions,
    initialData: {},
  })
}

export const useCurrentVaultAppSessionsQuery = () => {
  return useQuery({
    queryKey: currentVaultAppSessionsQueryKey,
    queryFn: async (): Promise<Record<string, AppSession>> => {
      const vaultId = await getCurrentVaultId()
      const sessions = await getVaultsAppSessions()
      return vaultId ? (sessions[vaultId] ?? {}) : {}
    },
  })
}
