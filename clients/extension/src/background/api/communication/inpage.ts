import { Result } from '@lib/utils/types/Result'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'
import {
  BackgroundApiRequest,
  BackgroundApiResponse,
  getBackgroundApiMessageSourceId,
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

    const { sourceId, id, result } = data as BackgroundApiResponse<any>
    if (sourceId !== getBackgroundApiMessageSourceId('content')) return

    const listener = listeners[id]
    if (listener) {
      listener(result)
      delete listeners[id]
    }
  })
}
