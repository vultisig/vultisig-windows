import { isBridgeMessage } from './core'

export const runBridgeContentAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBridgeMessage(data, 'inpage')) return

    // Enhanced message sending with error handling
    chrome.runtime.sendMessage(data, response => {
      if (chrome.runtime.lastError) {
        console.warn(
          '[Content] Runtime error:',
          chrome.runtime.lastError.message
        )

        // If the service worker is asleep, try to wake it up
        if (
          chrome.runtime.lastError.message?.includes(
            'Receiving end does not exist'
          )
        ) {
          console.log(
            '[Content] Service worker appears to be asleep, attempting to wake up'
          )

          // Try sending the message again after a short delay
          setTimeout(() => {
            chrome.runtime.sendMessage(data, retryResponse => {
              if (chrome.runtime.lastError) {
                console.error(
                  '[Content] Retry also failed:',
                  chrome.runtime.lastError.message
                )
                // Send error response back to inpage
                window.postMessage(
                  {
                    ...data,
                    error: 'Service worker unavailable',
                  },
                  '*'
                )
              } else {
                window.postMessage(retryResponse, '*')
              }
            })
          }, 500)
          return
        }

        window.postMessage(
          {
            ...data,
            error: chrome.runtime.lastError.message,
          },
          '*'
        )
        return
      }

      window.postMessage(response, '*')
    })
  })
}
