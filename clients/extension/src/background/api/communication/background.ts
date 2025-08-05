import { attempt } from '@lib/utils/attempt'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { backgroundApi } from '..'
import { BackgroundApiMethodName } from '../interface'
import { BackgroundApiResolver } from '../resolver'
import {
  BackgroundApiRequest,
  BackgroundApiResponse,
  getBackgroundApiMessageSourceId,
  isBackgroundApiMessage,
} from './core'

export const runBackgroundApiBackgroundAgent = () => {
  chrome.runtime.onMessage.addListener((request, { origin }, sendResponse) => {
    if (!origin) return

    if (!isBackgroundApiMessage<BackgroundApiRequest<any>>(request, 'inpage'))
      return

    const { call, id } = request

    const method = getRecordUnionKey(call)

    const handler = backgroundApi[method as BackgroundApiMethodName]
    if (!handler) return

    const input = getRecordUnionValue(call, method)

    attempt(
      (handler as BackgroundApiResolver<BackgroundApiMethodName>)({
        input,
        context: {
          requestOrigin: origin,
        },
      })
    ).then(result => {
      const response: BackgroundApiResponse<any> = {
        id,
        sourceId: getBackgroundApiMessageSourceId('background'),
        result,
      }

      sendResponse(response)
    })

    return true
  })
}
