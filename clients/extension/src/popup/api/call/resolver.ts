import {
  PopupInterface,
  PopupMethodName,
} from '@core/inpage-provider/popup/interface'
import { Resolver } from '@lib/utils/types/Resolver'

import { PopupApiCall } from '../communication/core'

export type CallPopupApiOptions = {
  closeOnFinish?: boolean
}

export type CallPopupApiResolverInput<M extends PopupMethodName> = {
  call: PopupApiCall<M>
  options: CallPopupApiOptions
}

export type CallPopupApiResolver<M extends PopupMethodName = PopupMethodName> =
  Resolver<CallPopupApiResolverInput<M>, Promise<PopupInterface[M]['output']>>
