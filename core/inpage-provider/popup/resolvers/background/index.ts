import { mergeableInFlightPopupMethods } from '@core/inpage-provider/popup/interface'
import { attempt } from '@vultisig/lib-utils/attempt'
import { withInFlightCoalescer } from '@vultisig/lib-utils/promise/coalesceInFlight'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { callIdQueryParam } from '../../config'
import { PopupError } from '../../error'
import {
  isPopupMessage,
  PopupCallResolver,
  PopupResponse,
} from '../../resolver'
import { addPopupViewCall, removePopupViewCall } from '../../view/state/calls'
import { inNewWindow } from './inNewWindow'
import { AppSessionWatch, watchAppSession } from './watchAppSession'

/**
 * Shows a dApp request to the user and resolves with their answer. A request
 * authorized by a site's session is cancelled with `Unauthorized` once that
 * session is removed, and taken off screen if it is showing.
 */
export const callPopupFromBackground: PopupCallResolver = withInFlightCoalescer(
  async ({ call, options, context }) => {
    const callId = await addPopupViewCall({ call, context })
    let sessionWatch: AppSessionWatch | undefined

    try {
      if ('appSession' in context) {
        sessionWatch = await watchAppSession(context.appSession)
      }
      const sessionSignal = sessionWatch?.signal

      return await inNewWindow({
        ...options,
        url: chrome.runtime.getURL(
          addQueryParams('popup.html', { [callIdQueryParam]: callId })
        ),
        windowId: context.requestWindowId,
        cancelSignal: sessionSignal,
        execute: ({ abortSignal, close }) =>
          new Promise<any>((resolve, reject) => {
            const stopListening = () => {
              chrome.runtime.onMessage.removeListener(handleMessage)
              abortSignal.removeEventListener('abort', handleAbort)
              sessionSignal?.removeEventListener('abort', handleSessionEnd)
            }

            const handleMessage = (response: any) => {
              if (!isPopupMessage<PopupResponse<any>>(response, 'popup')) return

              if (response.callId !== callId) return

              stopListening()

              const { error, data } = response.result
              if (error) {
                reject(error)
              } else {
                resolve(data)
              }

              if (response.shouldClosePopup || options.shouldClosePopup) {
                close()
              }
            }

            const handleAbort = () => {
              stopListening()
              reject(PopupError.RejectedByUser)
            }

            const handleSessionEnd = () => {
              stopListening()
              close()
              reject(sessionSignal?.reason)
            }

            if (sessionSignal?.aborted) {
              handleSessionEnd()
              return
            }

            chrome.runtime.onMessage.addListener(handleMessage)
            abortSignal.addEventListener('abort', handleAbort, { once: true })
            sessionSignal?.addEventListener('abort', handleSessionEnd, {
              once: true,
            })
          }),
      })
    } finally {
      sessionWatch?.stop()
      // The popup drops its call as soon as it loads it. A popup that never
      // gets that far, because its window failed to open or was closed first,
      // would leave the call in storage for good. Removing it here is a no-op
      // otherwise, and a failed cleanup must not replace the popup's answer.
      await attempt(() => removePopupViewCall(callId))
    }
  },
  {
    shouldCoalesce: ({ call }) =>
      mergeableInFlightPopupMethods.includes(getRecordUnionKey(call)),
    getKey: ({ call, context }) => {
      const method = getRecordUnionKey(call)
      if (method !== 'grantVaultAccess') {
        return `${method}:${context.requestOrigin}`
      }

      const input = getRecordUnionValue(call, method)

      return `${method}:${context.requestOrigin}:${JSON.stringify(input)}`
    },
  }
)
