import { attempt } from '@lib/utils/attempt'

import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import {
  BackgroundApiRequest,
  getBackgroundApiMessageSourceId,
  isBackgroundApiMessage,
} from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener(
    async (request: unknown, { origin }, sendResponse) => {
      if (!origin) return

      if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(request, 'inpage'))
        return

      const { method, input, id } = request

      const handler = backgroundApi[method as BackgroundApiMethodName]
      if (!handler) return

      attempt(
        handler({
          input,
          context: {
            requestOrigin: origin,
          },
        })
      ).then(result => {
        sendResponse({
          id,
          sourceId: getBackgroundApiMessageSourceId('background'),
          result,
        })
      })

      return true
    }
  )
}
