import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

type UpdateAppSessionFieldsInput = {
  vaultId: string
  host: string
  fields: Partial<AppSession>
}

export type AppSession = {
  host: string
  url: string
  selectedEVMChainId?: string
  selectedCosmosChainId?: string
}

export type VaultsAppSessions = Record<string, Record<string, AppSession>>

export const setVaultsAppSessions = async (
  sessions: VaultsAppSessions
): Promise<void> => {
  await setStorageValue<VaultsAppSessions>(StorageKey.appSessions, sessions)
}

export const getVaultsAppSessions = async (): Promise<VaultsAppSessions> => {
  return getStorageValue<VaultsAppSessions>(StorageKey.appSessions, {})
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
