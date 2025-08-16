import {
  type BridgeMessage,
  getBridgeMessageSourceId,
  isBridgeMessage,
} from './core'

const listeners: Record<string, (result: unknown) => void> = {}

export const sendToBackground = <T>(message: unknown): Promise<T> =>
  new Promise(resolve => {
    const id = crypto.randomUUID()

    listeners[id] = response => {
      resolve(response as T)
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
      listener(message)
      delete listeners[id]
    }
  })
}
