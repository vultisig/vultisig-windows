import {
  mergeableInFlightPopupMethods,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { createInFlightCoalescer } from '@lib/utils/promise/coalesceInFlight'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'

import { callIdQueryParam } from '../../config'
import {
  isPopupMessage,
  PopupCallResolver,
  PopupCallResolverInput,
  PopupResponse,
} from '../../resolver'
import { addPopupViewCall } from '../../view/state/calls'
import { inNewWindow } from './inNewWindow'

const inFlightCoalescer = createInFlightCoalescer<
  PopupCallResolverInput<any>,
  PopupInterface[PopupMethod]['output']
>({
  getKey: input => JSON.stringify(input),
  shouldCoalesce: input =>
    mergeableInFlightPopupMethods.includes(getRecordUnionKey(input.call)),
})

export const callPopupFromBackground: PopupCallResolver = async <
  M extends PopupMethod,
>({
  call,
  options,
  context,
}: PopupCallResolverInput<M>) => {
  return inFlightCoalescer({ call, options, context }, async () => {
    const callId = await addPopupViewCall({ call, context })

    return inNewWindow({
      ...options,
      url: chrome.runtime.getURL(
        addQueryParams('popup.html', { [callIdQueryParam]: callId })
      ),
      execute: abortSignal =>
        new Promise<PopupInterface[M]['output']>((resolve, reject) => {
          const handleMessage = (response: any) => {
            if (!isPopupMessage<PopupResponse<any>>(response, 'popup')) return

            if (response.callId !== callId) return

            chrome.runtime.onMessage.removeListener(handleMessage)
            abortSignal.removeEventListener('abort', handleAbort)

            const { error, data } = response.result
            if (error) {
              reject(error)
            } else {
              resolve(data as PopupInterface[M]['output'])
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
  })
}
