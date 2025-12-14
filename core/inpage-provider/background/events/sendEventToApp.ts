import { without } from '@lib/utils/array/without'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { BackgroundEventMessage, backgroundEventMsgType } from './core'
import { BackgroundEvent, BackgroundEventsInterface } from './interface'

type SendEventToAppInput<T extends BackgroundEvent> = {
  appId: string
  event: T
  value: BackgroundEventsInterface[T]
}

export const sendEventToApp = <T extends BackgroundEvent>({
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
