import {
  type BridgeMessage,
  getBridgeMessageSourceId,
  isBridgeMessage,
} from './core'

const listeners: Record<
  string,
  {
    resolve: (result: unknown) => void
    reject: (error: Error) => void
    timeout?: NodeJS.Timeout
  }
> = {}

export const sendToBackground = <T>(message: unknown): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = crypto.randomUUID()

    // Set up timeout for requests (30 seconds)
    const timeout = setTimeout(() => {
      delete listeners[id]
      reject(new Error('Request timeout after 30 seconds'))
    }, 30000)

    listeners[id] = {
      resolve: response => {
        clearTimeout(timeout)
        resolve(response as T)
      },
      reject: error => {
        clearTimeout(timeout)
        reject(error)
      },
      timeout,
    }

    const request: BridgeMessage = {
      id,
      sourceId: getBridgeMessageSourceId('inpage'),
      message,
    }

    window.postMessage(request, '*')
  })

export const runBridgeInpageAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBridgeMessage(data, 'background')) {
      return
    }

    const { id, message } = data

    const listener = listeners[id]
    if (listener) {
      // Check if this is an error response
      if ('error' in data && data.error) {
        listener.reject(new Error(data.error as string))
      } else {
        listener.resolve(message)
      }
      delete listeners[id]
    }
  })
}
