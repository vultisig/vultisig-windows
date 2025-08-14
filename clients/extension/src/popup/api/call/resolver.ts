import { Resolver } from '@lib/utils/types/Resolver'

import { PopupApiCall } from '../communication/core'
import { PopupApiInterface, PopupApiMethodName } from '../interface'

export type CallPopupApiOptions = {
  closeOnFinish?: boolean
}

export type CallPopupApiResolverInput<M extends PopupApiMethodName> = {
  call: PopupApiCall<M>
  options: CallPopupApiOptions
}

export type CallPopupApiResolver<
  M extends PopupApiMethodName = PopupApiMethodName,
> = Resolver<
  CallPopupApiResolverInput<M>,
  Promise<PopupApiInterface[M]['output']>
>
