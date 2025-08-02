import { contentSource, inpageSource, Request, Response } from './core'

export const sendMessageToContentScript = (message: Request): Promise<any> => {
  return new Promise((resolve, reject) => {
    listeners[message.id] = ({ result }) => {
      if (result.error) reject(result.error)
      else resolve(result.data)
    }

    window.postMessage(
      {
        source: inpageSource,
        payload: message,
      },
      '*'
    )
  })
}

const listeners: Record<string, (response: Response) => void> = {}

export const listen = () => {
  window.addEventListener('message', event => {
    if (
      event.source !== window ||
      !event.data ||
      event.data.source !== contentSource
    )
      return

    const response: Response = event.data.payload
    const listener = listeners[response.id]
    if (listener) {
      listener(response)
      delete listeners[response.id]
    }
  })
}
