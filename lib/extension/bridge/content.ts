import { isBridgeMessage } from './core'

export const runBridgeContentAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBridgeMessage(data, 'inpage')) return

    chrome.runtime.sendMessage(data, response => {
      window.postMessage(response, '*')
    })
  })
}
