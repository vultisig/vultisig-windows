import {
  authorizedMethods,
  mergeableInFlightPopupMethods,
} from '@core/inpage-provider/popup/interface'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { withInFlightCoalescer } from '@lib/utils/promise/coalesceInFlight'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'

import { authorizeContext } from '../../../background/core/authorization'
import { callIdQueryParam } from '../../config'
import {
  isPopupMessage,
  PopupCallResolver,
  PopupResponse,
} from '../../resolver'
import { addPopupViewCall } from '../../view/state/calls'
import { inNewWindow } from './inNewWindow'

export const callPopupFromBackground: PopupCallResolver = withInFlightCoalescer(
  async ({ call, options, context }) => {
    const method = getRecordUnionKey(call)

    const existingContext = shouldBePresent(context, 'bridge context')

    const augmentedContext = authorizedMethods.includes(method)
      ? await authorizeContext(existingContext)
      : existingContext

    const callId = await addPopupViewCall({ call, context: augmentedContext })

    return inNewWindow({
      ...options,
      url: chrome.runtime.getURL(
        addQueryParams('popup.html', { [callIdQueryParam]: callId })
      ),
      execute: abortSignal =>
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
          }

          const handleAbort = () => {
            chrome.runtime.onMessage.removeListener(handleMessage)
            reject(new Error('Popup window was closed'))
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
