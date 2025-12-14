import { storage } from '@core/extension/storage'
import { AppSession } from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@lib/utils/array/without'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { BackgroundEventMessage, backgroundEventMsgType } from './core'
import { BackgroundEvent, BackgroundEventsInterface } from './interface'

type SendEventToAppInput<T extends BackgroundEvent> = {
  appId: string
  event: T
  value: BackgroundEventsInterface[T]
}

const sendEventToApp = <T extends BackgroundEvent>({
  appId,
  event,
  value,
}: SendEventToAppInput<T>) => {
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
        event,
        value,
      }
      chrome.tabs.sendMessage(tabId, message)
    })
  })
}

export const runBackgroundEventsAgent = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (!(StorageKey.appSessions in changes)) return

    const { newValue, oldValue } = changes[StorageKey.appSessions]

    if (!oldValue) return

    const currentVaultId = await storage.getCurrentVaultId()
    if (!currentVaultId) return

    const prevSessions: Record<string, AppSession> =
      oldValue[currentVaultId] ?? {}
    const nextSessions: Record<string, AppSession> =
      newValue?.[currentVaultId] ?? {}

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
