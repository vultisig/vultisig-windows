import { attempt } from '@lib/utils/attempt'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import {
  BackgroundApiRequest,
  getBackgroundApiMessageSourceId,
  isBackgroundApiMessage,
} from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener(
    async (request, { origin }, sendResponse) => {
      if (!origin) return

      if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(request, 'inpage'))
        return

      const { call, id } = request

      const handler =
        backgroundApi[getRecordUnionKey(call) as BackgroundApiMethodName]
      if (!handler) return

      attempt(
        handler({
          input: getRecordUnionValue(call),
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
