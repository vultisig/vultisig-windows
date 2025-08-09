import { v4 as uuidv4 } from 'uuid'

import {
  getInpageBackgroundMessageSourceId,
  InpageBackgroundMessage,
  isInpageBackgroundChannelMessage,
} from './core'

const listeners: Record<string, (result: unknown) => void> = {}

export const sendThroughInpageBackgroundChannel = <T>(
  message: unknown
): Promise<T> =>
  new Promise(resolve => {
    const id = uuidv4()

    listeners[id] = response => {
      resolve(response as T)
    }

    const request: InpageBackgroundMessage = {
      id,
      sourceId: getInpageBackgroundMessageSourceId('inpage'),
      message,
    }

    window.postMessage(request, '*')
  })

export const runInpageBackgroundChannelInpageAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isInpageBackgroundChannelMessage(data, 'background')) {
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
