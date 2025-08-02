import { contentSource, inpageSource } from './core'

export const listen = () => {
  window.addEventListener('message', event => {
    if (event.source !== window) return

    const { source, ...rest } = event.data
    if (source !== inpageSource) return

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
