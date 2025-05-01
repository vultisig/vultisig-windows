import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

export interface AppSession {
  host: string
  chainIds?: string[]
  addresses?: string[]
  url: string
}

export type VaultsAppSessions = Record<string, Record<string, AppSession>>

export const appSessionsQueryKey = 'appSessions'

export const useVaultsAppSessionsQuery = () => {
  return usePersistentStateQuery<VaultsAppSessions>(appSessionsQueryKey, {})
}

export const useVaultsAppSessionsMutation = () => {
  return usePersistentStateMutation<VaultsAppSessions>(appSessionsQueryKey)
}

export const getVaultsAppSessions = async (): Promise<VaultsAppSessions> => {
  return await getPersistentState<VaultsAppSessions>(appSessionsQueryKey, {})
}

export const getVaultSessions = async (
  vaultId: string
): Promise<Record<string, AppSession>> => {
  const allSessions = await getVaultsAppSessions()
  return allSessions[vaultId] ?? {}
}
