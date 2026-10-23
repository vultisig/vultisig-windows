import { storage } from '@core/extension/storage'
import {
  getVaultsAppSessions,
  VaultAppSession,
  VaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

/** The session serving each connected site, keyed by host. */
export type SiteSessions = Record<string, VaultAppSession>

/** The stored inputs that decide which vault serves each site. */
export type SiteSessionsState = {
  sessions: VaultsAppSessions
  currentVaultId: CurrentVaultId
  vaultIds: string[]
}

/**
 * Resolves which vault serves each site. A site is served by the vault it
 * connected with, whichever vault is current. Sessions of deleted vaults are
 * ignored. A site held by several vaults (stored before sessions became one
 * vault per site) is served by the current vault when it is one of them, and
 * by none otherwise, so the site has to connect again.
 */
export const resolveSiteSessions = ({
  sessions,
  currentVaultId,
  vaultIds,
}: SiteSessionsState): SiteSessions => {
  const sessionsByHost: Record<string, VaultAppSession[]> = {}

  for (const vaultId of vaultIds) {
    for (const [host, session] of Object.entries(sessions[vaultId] ?? {})) {
      sessionsByHost[host] = [
        ...(sessionsByHost[host] ?? []),
        { ...session, vaultId },
      ]
    }
  }

  return Object.fromEntries(
    Object.entries(sessionsByHost).flatMap(([host, hostSessions]) => {
      const session =
        hostSessions.find(({ vaultId }) => vaultId === currentVaultId) ??
        (hostSessions.length === 1 ? hostSessions[0] : undefined)

      return session ? [[host, session]] : []
    })
  )
}

/** Reads the stored inputs of `resolveSiteSessions`. */
export const getSiteSessionsState = async (): Promise<SiteSessionsState> => {
  const [sessions, currentVaultId, vaults] = await Promise.all([
    getVaultsAppSessions(),
    storage.getCurrentVaultId(),
    storage.getVaults(),
  ])

  return { sessions, currentVaultId, vaultIds: vaults.map(getVaultId) }
}

/** The session serving the requesting site, read from storage by its origin. */
export const getAppSession = async (
  requestOrigin: string
): Promise<VaultAppSession | undefined> => {
  const siteSessions = resolveSiteSessions(await getSiteSessionsState())

  return siteSessions[getUrlBaseDomain(requestOrigin)]
}

/**
 * The vault serving the requesting site, or the current vault for a site that
 * isn't connected yet.
 */
export const getSiteVaultId = async (
  requestOrigin: string
): Promise<CurrentVaultId> => {
  const appSession = await getAppSession(requestOrigin)

  return appSession?.vaultId ?? storage.getCurrentVaultId()
}
