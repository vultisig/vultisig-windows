import {
  getVaultsAppSessions,
  VaultAppSessionKey,
  VaultsAppSessions,
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
  sessions: VaultsAppSessions
}

const hasAppSession = ({ sessions, vaultId, host }: HasAppSessionInput) =>
  Object.prototype.hasOwnProperty.call(sessions, vaultId) &&
  Object.prototype.hasOwnProperty.call(sessions[vaultId], host)

/**
 * Watches the session of one vault for one site. Resolves only after reading
 * storage once, so a session removed before the watch began aborts it as well.
 */
export const watchAppSession = async ({
  vaultId,
  host,
}: VaultAppSessionKey): Promise<AppSessionWatch> => {
  const controller = new AbortController()

  const handleChange: Parameters<
    typeof chrome.storage.onChanged.addListener
  >[0] = (changes, areaName) => {
    if (areaName === 'local' && StorageKey.appSessions in changes) {
      void check()
    }
  }

  const stop = () => chrome.storage.onChanged.removeListener(handleChange)

  const check = async () => {
    if (controller.signal.aborted) return

    const sessions = await getVaultsAppSessions()
    if (hasAppSession({ sessions, vaultId, host })) return

    stop()
    controller.abort(BackgroundError.Unauthorized)
  }

  chrome.storage.onChanged.addListener(handleChange)
  await check().catch(error => {
    stop()
    throw error
  })

  return { signal: controller.signal, stop }
}
