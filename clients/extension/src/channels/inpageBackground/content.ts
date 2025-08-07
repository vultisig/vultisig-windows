import { isInpageBackgroundChannelMessage } from './core'

export const runInpageBackgroundChannelContentAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isInpageBackgroundChannelMessage(data, 'inpage')) return

    chrome.runtime.sendMessage(data, response => {
      window.postMessage(response, '*')
    })
  })
}
