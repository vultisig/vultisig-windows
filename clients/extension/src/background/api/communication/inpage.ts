import { Result } from '@lib/utils/types/Result'
import { v4 as uuidv4 } from 'uuid'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'
import {
  BackgroundApiCall,
  BackgroundApiRequest,
  BackgroundApiResponse,
  isBackgroundApiMessage,
} from './core'

const listeners: Record<string, (result: Result) => void> = {}

export const callBackgroundApi = <M extends BackgroundApiMethodName>(
  call: BackgroundApiCall<M>
): Promise<BackgroundApiInterface[M]['output']> =>
  new Promise((resolve, reject) => {
    const id = uuidv4()

    listeners[id] = result => {
      if ('error' in result) {
        reject(result.error)
      }

      resolve(result.data as BackgroundApiInterface[M]['output'])
    }

    const request: BackgroundApiRequest<M> = {
      id,
      sourceId: 'inpage',
      ...call,
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
