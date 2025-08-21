import { productName } from '@core/config'
import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'

type PopupMessageSource = 'popup'

export const getPopupMessageSourceId = (source: PopupMessageSource) =>
  `${productName}-popup--${source}` as const

type PopupMessageSourceId = ReturnType<typeof getPopupMessageSourceId>

type PopupMessageKey = {
  sourceId: PopupMessageSourceId
  callId: string
}

export type PopupCall<M extends PopupMethod> = {
  [K in M]: PopupInterface[K]['input']
}

export type PopupResponse<M extends PopupMethod> = PopupMessageKey & {
  result: Result<PopupInterface[M]['output']>
}

export const isPopupMessage = <T extends PopupMessageKey>(
  message: unknown,
  source: PopupMessageSource
): message is T =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getPopupMessageSourceId(source)

export type PopupMessage<M extends PopupMethod = PopupMethod> = {
  call: PopupCall<M>
  options: PopupOptions
}

export type PopupOptions = {
  closeOnFinish?: boolean
}

export type PopupCallResolverInput<M extends PopupMethod> = {
  call: PopupCall<M>
  options: PopupOptions
  context?: BridgeContext
}

export type PopupCallResolver<M extends PopupMethod = PopupMethod> = Resolver<
  PopupCallResolverInput<M>,
  Promise<PopupInterface[M]['output']>
>
