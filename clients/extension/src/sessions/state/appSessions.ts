import { CosmosChainId, EVMChainId } from '@core/chain/coin/ChainId'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

export const appSessionsQueryKey = ['appSessions']
const [key] = appSessionsQueryKey

type UpdateAppSessionFieldsInput = {
  vaultId: string
  host: string
  fields: Partial<AppSession>
}

export interface AppSession {
  host: string
  chainIds?: string[]
  addresses?: string[]
  url: string
  selectedEVMChainId?: EVMChainId
  selectedCosmosChainId?: CosmosChainId
}

export type VaultsAppSessions = Record<string, Record<string, AppSession>>

export const setVaultsAppSessions = async (
  sessions: VaultsAppSessions
): Promise<void> => {
  await setPersistentState<VaultsAppSessions>(key, sessions)
}

export const getVaultsAppSessions = async (): Promise<VaultsAppSessions> => {
  return getPersistentState<VaultsAppSessions>(key, {})
}

export const getVaultAppSessions = async (
  vaultId: string
): Promise<Record<string, AppSession>> => {
  const allSessions = await getVaultsAppSessions()
  return allSessions[vaultId] ?? {}
}

export const updateAppSession = async ({
  vaultId,
  host,
  fields,
}: UpdateAppSessionFieldsInput): Promise<AppSession> => {
  const allSessions = await getVaultsAppSessions()
  const vaultSessions = allSessions[vaultId] ?? {}
  const existing = vaultSessions[host]

  if (!existing) {
    throw new Error(`No session found for host: ${host}`)
  }

  const updatedSession: AppSession = {
    ...existing,
    ...fields,
  }

  const updatedVaultSessions = {
    ...vaultSessions,
    [host]: updatedSession,
  }

  const updatedAll = {
    ...allSessions,
    [vaultId]: updatedVaultSessions,
  }

  await setVaultsAppSessions(updatedAll)
  return updatedSession
}
