import {
  getProviderSource,
  ProviderSource,
  providerSources,
} from '@core/inpage-provider/source'
import { isOneOf } from '@lib/utils/array/isOneOf'

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

  if (!isOneOf(source, providerSources)) {
    throw new Error(`Popup API is not supported in ${source}`)
  }

  return resolvers[source]({ call, options })
}
