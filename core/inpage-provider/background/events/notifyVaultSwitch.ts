import { storage } from '@core/extension/storage'
import { getVaultAppSessions } from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'

import { getVaultSwitchEvents } from './getVaultSwitchEvents'
import { sendEventToApp } from './sendEventToApp'

type NotifyVaultSwitchInput = {
  prevVaultId: CurrentVaultId
  nextVaultId: CurrentVaultId
}

const getVaultSessions = async (vaultId: CurrentVaultId) =>
  vaultId ? getVaultAppSessions(vaultId) : {}

/**
 * Tells connected apps the current vault changed. Storage listeners run
 * concurrently, so a slow handler for an older switch could finish after a
 * newer one; events are only sent if `nextVaultId` is still current once the
 * sessions are read, so a stale switch never disconnects an app.
 */
export const notifyVaultSwitch = async ({
  prevVaultId,
  nextVaultId,
}: NotifyVaultSwitchInput) => {
  if (!prevVaultId || prevVaultId === nextVaultId) return

  const [prevVaultSessions, nextVaultSessions] = await Promise.all([
    getVaultSessions(prevVaultId),
    getVaultSessions(nextVaultId),
  ])

  if ((await storage.getCurrentVaultId()) !== nextVaultId) return

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
}
