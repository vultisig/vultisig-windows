import { storage } from '@core/extension/storage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@lib/utils/array/without'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { BackgroundEventMessage, backgroundEventMsgType } from './core'
import { getAppSubscriptions } from './subscriptions'

export const runBackgroundEventsAgent = () => {
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

    removedApps.forEach(async appId => {
      const subscriptions = await getAppSubscriptions(appId)

      const subscriptionId = subscriptions.disconnect

      if (!subscriptionId) return

      chrome.tabs?.query({ url: '*://*/*' }, tabs => {
        const targetTabs = without(
          tabs.map(({ url, id }) => {
            if (!url || getUrlBaseDomain(url) !== appId) return

            return id
          }),
          undefined
        )

        targetTabs.forEach(tabId => {
          const message: BackgroundEventMessage = {
            type: backgroundEventMsgType,
            subscriptionId,
          }
          chrome.tabs.sendMessage(tabId, message)
        })
      })
    })
  })
}
