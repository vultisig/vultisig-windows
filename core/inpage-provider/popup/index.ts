import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { PopupCall } from '@core/inpage-provider/popup/resolver'

import { callInpageProviderBridgeBackgroundAgent } from '../bridge'

// Call the popup from the inpage using this method.
// For background context, use `callPopupFromBackground` and provide the appropriate `context`.
export const callPopup = async <M extends PopupMethod>(
  call: PopupCall<M>,
  options: { account?: string } = {}
): Promise<PopupInterface[M]['output']> =>
  callInpageProviderBridgeBackgroundAgent({
    popup: { call, options },
  })
