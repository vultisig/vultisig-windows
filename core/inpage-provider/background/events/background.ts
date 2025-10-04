import { storage } from '@core/extension/storage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@lib/utils/array/without'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { BackgroundEventMessage, backgroundEventMsgType } from './core'

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

    for (const appId of removedApps) {
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
            event: 'disconnect',
          }
          chrome.tabs.sendMessage(tabId, message)
        })
      })
    }
  })
}
