import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { CallPopupApiOptions } from '../call/resolver'
import { PopupApiInterface, PopupApiMethodName } from '../interface'

type PopupApiMessageSource = 'popup'

export const getPopupApiMessageSourceId = (source: PopupApiMessageSource) =>
  `${productName}-popup-api-${source}` as const

type PopupApiMessageSourceId = ReturnType<typeof getPopupApiMessageSourceId>

type PopupApiMessageKey = {
  sourceId: PopupApiMessageSourceId
}

export type PopupApiCall<M extends PopupApiMethodName> = {
  [K in M]: PopupApiInterface[K]['input']
}

export type PopupApiResponse<M extends PopupApiMethodName> =
  PopupApiMessageKey & { result: Result<PopupApiInterface[M]['output']> }

export const isPopupApiMessage = <T extends PopupApiMessageKey>(
  message: unknown,
  source: PopupApiMessageSource
): message is T =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getPopupApiMessageSourceId(source)

export type PopupApiMessage = {
  call: PopupApiCall<any>
  options: CallPopupApiOptions
}
