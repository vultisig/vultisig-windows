import { isBackgroundEventMessage } from './core'

export const runBackgroundEventsContentAgent = () => {
  chrome.runtime.onMessage.addListener(msg => {
    if (!isBackgroundEventMessage(msg)) return

    window.postMessage(msg, window.origin)
  })
}
