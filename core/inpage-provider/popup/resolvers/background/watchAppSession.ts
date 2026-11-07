import {
  getVaultsAppSessions,
  VaultAppSessionKey,
} from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { BackgroundError } from '../../../background/error'

/**
 * A watch on the session a dApp request was authorized with. `signal` aborts
 * with `BackgroundError.Unauthorized` once that session is gone, and `stop`
 * ends the watch once the request has settled.
 */
export type AppSessionWatch = {
  signal: AbortSignal
  stop: () => void
}

type HasAppSessionInput = VaultAppSessionKey & {
  sessions: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasOwnKey = (record: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key)

const hasAppSession = ({ sessions, vaultId, host }: HasAppSessionInput) => {
  if (!isRecord(sessions) || !hasOwnKey(sessions, vaultId)) return false

  const vaultSessions = sessions[vaultId]

  return isRecord(vaultSessions) && hasOwnKey(vaultSessions, host)
}

/**
 * Watches the session of one vault for one site. Resolves only after reading
 * storage once, so a session removed before the watch began aborts it as well.
 */
export const watchAppSession = async ({
  vaultId,
  host,
}: VaultAppSessionKey): Promise<AppSessionWatch> => {
  const controller = new AbortController()

  // Each change carries the sessions it wrote, so a removal is seen even when
  // a later write restores the session before storage could be read again.
  const handleChange: Parameters<
    typeof chrome.storage.onChanged.addListener
  >[0] = (changes, areaName) => {
    if (areaName !== 'local' || !(StorageKey.appSessions in changes)) return

    const sessions = changes[StorageKey.appSessions].newValue
    if (!hasAppSession({ sessions, vaultId, host })) end()
  }

  const stop = () => chrome.storage.onChanged.removeListener(handleChange)

  const end = () => {
    stop()
    controller.abort(BackgroundError.Unauthorized)
  }

  chrome.storage.onChanged.addListener(handleChange)

  const sessions = await getVaultsAppSessions().catch(error => {
    stop()
    throw error
  })
  if (!hasAppSession({ sessions, vaultId, host })) end()

  return { signal: controller.signal, stop }
}
