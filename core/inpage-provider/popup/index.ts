import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import {
  PopupCall,
  PopupCallResolver,
  PopupOptions,
} from '@core/inpage-provider/popup/resolver'
import { BridgeSide, getBridgeSide } from '@lib/extension/bridge/side'

import { callPopupFromBackground } from './resolvers/background'
import { callPopupFromInpage } from './resolvers/inpage'

const resolvers: Record<BridgeSide, PopupCallResolver<any>> = {
  background: callPopupFromBackground,
  inpage: callPopupFromInpage,
}

export const callPopup = async <M extends PopupMethod>(
  call: PopupCall<M>,
  options: PopupOptions = { closeOnFinish: true }
): Promise<PopupInterface[M]['output']> => {
  const source = getBridgeSide()

  return resolvers[source]({ call, options })
}
