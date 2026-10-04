import { storage } from '@core/extension/storage'
import { getVaultAppSessions } from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'

import { getVaultSwitchEvents } from './getVaultSwitchEvents'
import { sendEventToApp } from './sendEventToApp'

type NotifyVaultSwitchInput = {
  /** The vault the storage change replaced. */
  prevVaultId: CurrentVaultId
}

const getVaultSessions = async (vaultId: CurrentVaultId) =>
  vaultId ? getVaultAppSessions(vaultId) : {}

/**
 * Creates the handler that tells connected apps the current vault changed.
 * Storage listeners run concurrently, so switches are processed one at a
 * time and each one reconciles the last vault apps were told about with the
 * vault that is current now. A burst like A -> B -> C therefore disconnects
 * A's apps even if the B handler is superseded, and A -> B -> A sends
 * nothing.
 */
export const createVaultSwitchNotifier = () => {
  let lastNotifiedVaultId: CurrentVaultId = null
  let queue: Promise<void> = Promise.resolve()

  const notify = async ({ prevVaultId }: NotifyVaultSwitchInput) => {
    const fromVaultId = lastNotifiedVaultId ?? prevVaultId
    let toVaultId = await storage.getCurrentVaultId()

    while (fromVaultId && fromVaultId !== toVaultId) {
      const [prevVaultSessions, nextVaultSessions] = await Promise.all([
        getVaultSessions(fromVaultId),
        getVaultSessions(toVaultId),
      ])

      // Session reads may outlive another switch. Keep the original source
      // until events are actually sent, and reconcile against the latest vault.
      const currentVaultId = await storage.getCurrentVaultId()
      if (currentVaultId !== toVaultId) {
        toVaultId = currentVaultId
        continue
      }

      const { disconnect, accountsChanged } = getVaultSwitchEvents({
        prevVaultSessions,
        nextVaultSessions,
      })

      for (const appId of disconnect) {
        sendEventToApp({ appId, event: 'disconnect', value: undefined })
      }

      for (const appId of accountsChanged) {
        sendEventToApp({ appId, event: 'accountsChanged', value: undefined })
      }

      break
    }

    lastNotifiedVaultId = toVaultId
  }

  return (input: NotifyVaultSwitchInput) => {
    const next = queue.then(() => notify(input))
    queue = next.catch(() => undefined)
    return next
  }
}
