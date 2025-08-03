import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { PopupApiInterface, PopupApiMethodName } from '../interface'

type PopupApiMessageSource = 'background'

export const getPopupApiMessageSourceId = (source: PopupApiMessageSource) =>
  `${productName}-popup-api-${source}` as const

type PopupApiMessageSourceId = ReturnType<typeof getPopupApiMessageSourceId>

type PopupApiMessageKey = {
  sourceId: PopupApiMessageSourceId
}

export type PopupApiCall<M extends PopupApiMethodName> = {
  method: M
} & ([PopupApiInterface[M]['input']] extends [undefined]
  ? { input?: PopupApiInterface[M]['input'] }
  : { input: PopupApiInterface[M]['input'] })

export type PopupApiRequest<M extends PopupApiMethodName> = PopupApiMessageKey &
  PopupApiCall<M>

export type PopupApiResponse<M extends PopupApiMethodName> = Result<
  PopupApiInterface[M]['output']
>

export const isPopupApiMessage = <T extends PopupApiMessageKey>(
  message: unknown,
  source: PopupApiMessageSource
): message is T =>
  typeof message === 'object' &&
  message !== null &&
  'id' in message &&
  'sourceId' in message &&
  message.sourceId === getPopupApiMessageSourceId(source)
