import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { BackgroundApiContext } from '../context'
import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'

type BackgroundApiMessageSource = 'inpage' | 'background'

export const getBackgroundApiMessageSourceId = (
  source: BackgroundApiMessageSource
) => `${productName}-background-api-${source}` as const

type BackgroundApiMessageSourceId = ReturnType<
  typeof getBackgroundApiMessageSourceId
>

type BackgroundApiMessageKey = {
  id: string
  sourceId: BackgroundApiMessageSourceId
}

export type BackgroundApiCall<M extends BackgroundApiMethodName> = {
  [K in M]: BackgroundApiInterface[K]['input']
}

export type BackgroundApiRequest<M extends BackgroundApiMethodName> =
  BackgroundApiMessageKey & { call: BackgroundApiCall<M> }

export type BackgroundApiResponse<M extends BackgroundApiMethodName> =
  BackgroundApiMessageKey & {
    result: Result<BackgroundApiInterface[M]['output']>
  }

export const isBackgroundApiMessage = <T extends BackgroundApiMessageKey>(
  message: unknown,
  source: BackgroundApiMessageSource
): message is T =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === getBackgroundApiMessageSourceId(source)

export type BackgroundApiMessage = {
  call: BackgroundApiCall<any>
  context: BackgroundApiContext
}
