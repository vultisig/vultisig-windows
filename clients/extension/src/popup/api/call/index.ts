import {
  PopupInterface,
  PopupMethodName,
} from '@core/inpage-provider/popup/interface'
import { getProviderSource, ProviderSource } from '@core/inpage-provider/source'

import { PopupApiCall } from '../communication/core'
import { CallPopupApiOptions, CallPopupApiResolver } from './resolver'
import { callPopupApiFromBackground } from './resolvers/background'
import { callPopupApiFromInpage } from './resolvers/inpage'

const resolvers: Record<ProviderSource, CallPopupApiResolver<any>> = {
  background: callPopupApiFromBackground,
  inpage: callPopupApiFromInpage,
}

export const callPopupApi = async <M extends PopupMethodName>(
  call: PopupApiCall<M>,
  options: CallPopupApiOptions = { closeOnFinish: true }
): Promise<PopupInterface[M]['output']> => {
  const source = getProviderSource()

  return resolvers[source]({ call, options })
}
