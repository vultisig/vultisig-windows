import { getBackgroundApiMessageSourceId } from './core'

export const runBackgroundApiContentAgent = () => {
  window.addEventListener('message', event => {
    if (event.source !== window) return

    const { sourceId, ...rest } = event.data
    if (sourceId !== getBackgroundApiMessageSourceId('inpage')) return

    chrome.runtime.sendMessage(rest, response => {
      window.postMessage(
        {
          source: contentSource,
          ...response,
        },
        '*'
      )
    })
  })
}
