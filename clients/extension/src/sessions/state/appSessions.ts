import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

export const appSessionsQueryKey = 'appSessions'

export interface AppSession {
  host: string
  chainIds?: string[]
  addresses?: string[]
  url: string
}

export type SetVaultsAppSessionsFunction = (
  sessions: VaultsAppSessions
) => Promise<void>

export type GetVaultsAppSessionsFunction = () => Promise<VaultsAppSessions>

export type VaultsAppSessions = Record<string, Record<string, AppSession>>

export const setVaultsAppSessions = async (
  sessions: VaultsAppSessions
): Promise<void> => {
  await setPersistentState<VaultsAppSessions>(appSessionsQueryKey, sessions)
}

export const getVaultsAppSessions = async (): Promise<VaultsAppSessions> => {
  return getPersistentState<VaultsAppSessions>(appSessionsQueryKey, {})
}

export const getVaultAppSessions = async (
  vaultId: string
): Promise<Record<string, AppSession>> => {
  const allSessions = await getVaultsAppSessions()
  return allSessions[vaultId] ?? {}
}
