import { productName } from '@core/config'
import {
  PopupInterface,
  PopupMethodName,
} from '@core/inpage-provider/popup/interface'
import { Result } from '@lib/utils/types/Result'

import { CallPopupApiOptions } from '../call/resolver'

type PopupApiMessageSource = 'popup'

export const getPopupApiMessageSourceId = (source: PopupApiMessageSource) =>
  `${productName}-popup-api-${source}` as const

type PopupApiMessageSourceId = ReturnType<typeof getPopupApiMessageSourceId>

type PopupApiMessageKey = {
  sourceId: PopupApiMessageSourceId
}

export type PopupApiCall<M extends PopupMethodName> = {
  [K in M]: PopupInterface[K]['input']
}

export type PopupApiResponse<M extends PopupMethodName> = PopupApiMessageKey & {
  result: Result<PopupInterface[M]['output']>
}

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
