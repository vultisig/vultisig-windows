import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { PopupCall, PopupOptions } from '@core/inpage-provider/popup/resolver'
import { getBridgeSide } from '@lib/extension/bridge/side'

import { callInpageProviderBridgeBackgroundAgent } from '../bridge'

export const callPopup = async <M extends PopupMethod>(
  call: PopupCall<M>,
  options: PopupOptions & { account?: string } = { closeOnFinish: true }
): Promise<PopupInterface[M]['output']> => {
  const side = getBridgeSide()
  if (side !== 'inpage') {
    throw new Error('Popup can only be called from inpage')
  }

  return callInpageProviderBridgeBackgroundAgent({
    popup: { call, options },
  })
}
