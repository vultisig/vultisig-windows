import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { PopupCall, PopupOptions } from '@core/inpage-provider/popup/resolver'
import { attempt } from '@vultisig/lib-utils/attempt'

import { callInpageProviderBridgeBackgroundAgent } from '../bridge'
import { toPopupCallError } from './error'

/**
 * Calls the popup from the inpage context. For the background context use
 * `callPopupFromBackground` and provide the appropriate `context`.
 *
 * Failures are rethrown through {@link toPopupCallError}, so a rejection keeps
 * the `PopupError.RejectedByUser` identity providers match on while every other
 * sentinel arrives as an `Error` a dApp can read.
 */
export const callPopup = async <M extends PopupMethod>(
  call: PopupCall<M>,
  options: PopupOptions = {}
): Promise<PopupInterface[M]['output']> => {
  const result = await attempt(() =>
    callInpageProviderBridgeBackgroundAgent({
      popup: { call, options },
    })
  )

  if ('error' in result) {
    throw toPopupCallError(result.error)
  }

  return result.data
}
