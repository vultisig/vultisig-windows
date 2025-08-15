import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { Resolver } from '@lib/utils/types/Resolver'

import { PopupApiCall } from '../communication/core'

export type CallPopupApiOptions = {
  closeOnFinish?: boolean
}

export type CallPopupResolverInput<M extends PopupMethod> = {
  call: PopupApiCall<M>
  options: CallPopupApiOptions
}

export type CallPopupResolver<M extends PopupMethod = PopupMethod> = Resolver<
  CallPopupResolverInput<M>,
  Promise<PopupInterface[M]['output']>
>
