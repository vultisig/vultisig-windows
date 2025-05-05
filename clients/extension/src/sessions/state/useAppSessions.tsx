import { useQuery } from '@tanstack/react-query'

import { getCurrentVaultId } from '../../vault/state/currentVaultId'
import {
  AppSession,
  appSessionsQueryKey,
  getVaultsAppSessions,
} from './appSessions'

export const useAppSessionsQuery = () => {
  return useQuery({
    queryKey: appSessionsQueryKey,
    queryFn: getVaultsAppSessions,
    initialData: {},
  })
}

export const useCurrentVaultAppSessions = async (): Promise<
  Record<string, AppSession>
> => {
  const vaultId = await getCurrentVaultId()
  const sessions = await getVaultsAppSessions()
  return vaultId ? (sessions[vaultId] ?? {}) : {}
}
