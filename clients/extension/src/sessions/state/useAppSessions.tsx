import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useQuery } from '@tanstack/react-query'

import { useExtensionStorage } from '../../state/extensionStorage'
import {
  AppSession,
  appSessionsQueryKey,
  VaultsAppSessions,
} from './appSessions'

const useAppSessionsQuery = () => {
  const { getVaultsAppSessions } = useExtensionStorage()

  return useQuery({
    queryKey: [appSessionsQueryKey],
    queryFn: getVaultsAppSessions,
    initialData: {},
  })
}

export const useAppSessions = (): VaultsAppSessions => {
  const { data } = useAppSessionsQuery()
  return data
}

export const useCurrentVaultAppSessions = (): Record<string, AppSession> => {
  const vaultId = useCurrentVaultId()
  const sessions = useAppSessions()
  return vaultId ? (sessions[vaultId] ?? {}) : {}
}
