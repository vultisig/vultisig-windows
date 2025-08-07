import { isOneOf } from '@lib/utils/array/isOneOf'

import { detectScriptType } from '../../../messengers/detectScriptType'
import { PopupApiCall } from '../communication/core'
import { PopupApiInterface, PopupApiMethodName } from '../interface'
import { CallPopupApiOptions, CallPopupApiResolver } from './resolver'
import { callPopupApiFromBackground } from './resolvers/background'
import { callPopupApiFromInpage } from './resolvers/inpage'

const popupApiSupportedSources = ['background', 'inpage']
type PopupApiSupportedSource = (typeof popupApiSupportedSources)[number]

const resolvers: Record<PopupApiSupportedSource, CallPopupApiResolver<any>> = {
  background: callPopupApiFromBackground,
  inpage: callPopupApiFromInpage,
}

export const callPopupApi = async <M extends PopupApiMethodName>(
  call: PopupApiCall<M>,
  options: CallPopupApiOptions = { closeOnFinish: true }
): Promise<PopupApiInterface[M]['output']> => {
  const source = detectScriptType()

  if (!isOneOf(source, popupApiSupportedSources)) {
    throw new Error(`Popup API is not supported in ${source}`)
  }

  return resolvers[source]({ call, options })
}
