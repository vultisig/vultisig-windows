import { mergeableInFlightPopupMethods } from '@core/inpage-provider/popup/interface'
import { withInFlightCoalescer } from '@lib/utils/promise/coalesceInFlight'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'

import { callIdQueryParam } from '../../config'
import { PopupError } from '../../error'
import {
  isPopupMessage,
  PopupCallResolver,
  PopupResponse,
} from '../../resolver'
import { addPopupViewCall } from '../../view/state/calls'
import { inNewWindow } from './inNewWindow'

export const callPopupFromBackground: PopupCallResolver = withInFlightCoalescer(
  async ({ call, options, context }) => {
    const callId = await addPopupViewCall({ call, context })

    return inNewWindow({
      ...options,
      url: chrome.runtime.getURL(
        addQueryParams('popup.html', { [callIdQueryParam]: callId })
      ),
      execute: ({ abortSignal, close }) =>
        new Promise<any>((resolve, reject) => {
          const handleMessage = (response: any) => {
            if (!isPopupMessage<PopupResponse<any>>(response, 'popup')) return

            if (response.callId !== callId) return

            chrome.runtime.onMessage.removeListener(handleMessage)
            abortSignal.removeEventListener('abort', handleAbort)

            const { error, data } = response.result
            if (error) {
              reject(error)
            } else {
              resolve(data)
            }

            if (response.shouldClosePopup) {
              close()
            }
          }

          const handleAbort = () => {
            chrome.runtime.onMessage.removeListener(handleMessage)
            reject(PopupError.RejectedByUser)
          }

          chrome.runtime.onMessage.addListener(handleMessage)
          abortSignal.addEventListener('abort', handleAbort, { once: true })
        }),
    })
  },
  {
    shouldCoalesce: ({ call }) =>
      mergeableInFlightPopupMethods.includes(getRecordUnionKey(call)),
  }
)
