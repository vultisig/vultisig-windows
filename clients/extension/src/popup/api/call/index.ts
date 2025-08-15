import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { getProviderSource, ProviderSource } from '@core/inpage-provider/source'

import { PopupApiCall } from '../communication/core'
import { CallPopupApiOptions, CallPopupResolver } from './resolver'
import { callPopupApiFromBackground } from './resolvers/background'
import { callPopupApiFromInpage } from './resolvers/inpage'

const resolvers: Record<ProviderSource, CallPopupResolver<any>> = {
  background: callPopupApiFromBackground,
  inpage: callPopupApiFromInpage,
}

export const callPopupApi = async <M extends PopupMethod>(
  call: PopupApiCall<M>,
  options: CallPopupApiOptions = { closeOnFinish: true }
): Promise<PopupInterface[M]['output']> => {
  const source = getProviderSource()

  return resolvers[source]({ call, options })
}
