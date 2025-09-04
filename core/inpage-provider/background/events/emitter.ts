import { storage } from '@core/extension/storage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@lib/utils/array/without'

import { backgroundEventSubscriptions } from './subscriptions'

export const runBackgroundEventsEmitter = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (!(StorageKey.appSessions in changes)) return

    const { newValue, oldValue } = changes[StorageKey.appSessions]

    if (!oldValue) return

    const currentVaultId = await storage.getCurrentVaultId()
    if (!currentVaultId) return

    const prevSessions = oldValue[currentVaultId] ?? {}
    const nextSessions = newValue?.[currentVaultId] ?? {}

    const prevApps = Object.keys(prevSessions)
    const nextApps = Object.keys(nextSessions)

    const removedApps = without(prevApps, ...nextApps)

    removedApps.forEach(appId => {
      if (!(appId in backgroundEventSubscriptions)) return

      const subscriptions = backgroundEventSubscriptions[appId]

      const subscriptionId = subscriptions.disconnect

      if (!subscriptionId) return

      chrome.tabs?.query({ url: '*://*/*' }, tabs => {
        for (const tab of tabs) {
          if (!tab.id) continue
          chrome.tabs.sendMessage(
            tab.id,
            {
              topic: '> backgroundEvents:emit',
              payload: { id: subscriptionId, value: undefined, host: appId },
            },
            () => {}
          )
        }
      })
    })
  })
}
