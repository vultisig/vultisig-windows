import {
  AuthorizedPopupMethod,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { productName } from '@vultisig/core-config'
import { Resolver } from '@vultisig/lib-utils/types/Resolver'
import { Result } from '@vultisig/lib-utils/types/Result'

import { MethodBasedContext } from '../call/context'
import { PopupError } from './error'

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

/**
 * A popup response crosses `chrome.runtime` messaging, which serializes it,
 * so the failure side is restricted to `PopupError` sentinels. Anything
 * richer — notably an `Error` instance — would arrive as a bare `{}` and
 * lose its message, so passing one is a compile error.
 */
export type PopupResponse<M extends PopupMethod> = PopupMessageKey & {
  result: Result<PopupInterface[M]['output'], PopupError>
  shouldClosePopup: boolean
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
  account?: string
  shouldClosePopup?: boolean
}

type PopupCallResolverInput<M extends PopupMethod> = M extends PopupMethod
  ? {
      call: PopupCall<M>
      options: PopupOptions
      context: MethodBasedContext<M, AuthorizedPopupMethod>
    }
  : never

export type PopupCallResolver<M extends PopupMethod = PopupMethod> = Resolver<
  PopupCallResolverInput<M>,
  Promise<PopupInterface[M]['output']>
>
