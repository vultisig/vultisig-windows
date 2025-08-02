import { Result } from '@lib/utils/types/Result'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'
import {
  BackgroundApiRequest,
  BackgroundApiResponse,
  isBackgroundApiMessage,
} from './core'

const listeners: Record<string, (result: Result) => void> = {}

export const sendBackgroundApiRequestToContentScript = <
  M extends BackgroundApiMethodName,
>(
  request: BackgroundApiRequest<M>
): Promise<BackgroundApiInterface[M]['output']> =>
  new Promise((resolve, reject) => {
    listeners[request.id] = result => {
      if ('error' in result) {
        reject(result.error)
      }

      resolve(result.data as BackgroundApiInterface[M]['output'])
    }

    window.postMessage(request, '*')
  })

export const runBackgroundApiInpageAgent = () => {
  window.addEventListener('message', ({ source, data }) => {
    if (source !== window) return

    if (!isBackgroundApiMessage<BackgroundApiResponse<any>>(data, 'background'))
      return

    const { id, result } = data

    const listener = listeners[id]
    if (listener) {
      listener(result)
      delete listeners[id]
    }
  })
}
