import { storage } from '@core/extension/storage'
import { VaultsAppSessions } from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@lib/utils/array/without'

import { sendEventToApp } from './sendEventToApp'

export const runBackgroundEventsAgent = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (!(StorageKey.appSessions in changes)) return

    const { newValue, oldValue } = changes[StorageKey.appSessions] as {
      newValue?: VaultsAppSessions
      oldValue: VaultsAppSessions
    }

    if (!oldValue) return

    const currentVaultId = await storage.getCurrentVaultId()
    if (!currentVaultId) return

    const prevSessions = oldValue[currentVaultId] ?? {}
    const nextSessions = newValue?.[currentVaultId] ?? {}

    const prevApps = Object.keys(prevSessions)
    const nextApps = Object.keys(nextSessions)

    const removedApps = without(prevApps, ...nextApps)

    for (const appId of removedApps) {
      sendEventToApp({ appId, event: 'disconnect', value: undefined })
    }

    for (const appId of nextApps) {
      const prevSession = prevSessions[appId]
      const nextSession = nextSessions[appId]

      if (!prevSession || !nextSession) continue

      const prevChainId = prevSession.selectedEVMChainId
      const nextChainId = nextSession.selectedEVMChainId

      if (prevChainId && nextChainId && prevChainId !== nextChainId) {
        sendEventToApp({
          appId,
          event: 'evmChainChanged',
          value: nextChainId,
        })
      }
    }
  })
}
