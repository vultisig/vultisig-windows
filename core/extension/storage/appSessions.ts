import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { omit } from '@vultisig/lib-utils/record/omit'
import { recordMap } from '@vultisig/lib-utils/record/recordMap'

let appSessionsMutationChain: Promise<unknown> = Promise.resolve()

const serializeAppSessionsMutation = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = appSessionsMutationChain.then(fn, fn)
  appSessionsMutationChain = next.catch(() => undefined)
  return next
}

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
  icon?: string
}

export type VaultAppSession = {
  vaultId: string
} & AppSession

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

export const updateAppSession = ({
  vaultId,
  host,
  fields,
}: UpdateAppSessionFieldsInput): Promise<AppSession> =>
  serializeAppSessionsMutation(async () => {
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

    await setVaultsAppSessions({
      ...allSessions,
      [vaultId]: {
        ...vaultSessions,
        [host]: updatedSession,
      },
    })
    return updatedSession
  })

export const setExclusiveVaultAppSession = ({
  vaultId,
  ...session
}: VaultAppSession): Promise<void> =>
  serializeAppSessionsMutation(async () => {
    const allSessions = await getVaultsAppSessions()
    const sessionsWithoutHost = recordMap(allSessions, vaultSessions =>
      omit(vaultSessions, session.host)
    )

    await setVaultsAppSessions({
      ...sessionsWithoutHost,
      [vaultId]: {
        ...sessionsWithoutHost[vaultId],
        [session.host]: session,
      },
    })
  })

export type VaultAppSessionKey = Pick<VaultAppSession, 'vaultId' | 'host'>

export const removeVaultAppSession = ({
  vaultId,
  host,
}: VaultAppSessionKey): Promise<void> =>
  serializeAppSessionsMutation(async () => {
    const allSessions = await getVaultsAppSessions()

    await setVaultsAppSessions({
      ...allSessions,
      [vaultId]: omit(allSessions[vaultId], host),
    })
  })

export const removeAllVaultAppSessions = (vaultId: string): Promise<void> =>
  serializeAppSessionsMutation(async () => {
    const allSessions = await getVaultsAppSessions()
    await setVaultsAppSessions(omit(allSessions, vaultId))
  })
