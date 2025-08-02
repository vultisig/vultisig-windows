import {
  BackgroundApiRequest,
  getBackgroundApiMessageSourceId,
  isBackgroundApiMessage,
} from './core'

export const runBackgroundApiContentAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(data, 'inpage'))
      return

    chrome.runtime.sendMessage(data, response => {
      window.postMessage(
        {
          sourceId: getBackgroundApiMessageSourceId('background'),
          ...response,
        },
        '*'
      )
    })
  })
}
