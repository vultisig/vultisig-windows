import { getProviderSource, ProviderSource } from '@core/inpage-provider/source'

import { PopupApiCall } from '../communication/core'
import { PopupApiInterface, PopupApiMethodName } from '../interface'
import { CallPopupApiOptions, CallPopupApiResolver } from './resolver'
import { callPopupApiFromBackground } from './resolvers/background'
import { callPopupApiFromInpage } from './resolvers/inpage'

const resolvers: Record<ProviderSource, CallPopupApiResolver<any>> = {
  background: callPopupApiFromBackground,
  inpage: callPopupApiFromInpage,
}

export const callPopupApi = async <M extends PopupApiMethodName>(
  call: PopupApiCall<M>,
  options: CallPopupApiOptions = { closeOnFinish: true }
): Promise<PopupApiInterface[M]['output']> => {
  const source = getProviderSource()

  return resolvers[source]({ call, options })
}
