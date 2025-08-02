import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'

type BackgroundApiMessageSource = 'inpage' | 'background'

export const getBackgroundApiMessageSourceId = (
  source: BackgroundApiMessageSource
) => `${productName}-background-api-${source}` as const

export type BackgroundApiMessageSourceId = ReturnType<
  typeof getBackgroundApiMessageSourceId
>

type BackgroundApiMessageKey = {
  id: string
  sourceId: BackgroundApiMessageSourceId
}

export type BackgroundApiCall<M extends BackgroundApiMethodName> = {
  method: M
} & ([BackgroundApiInterface[M]['input']] extends [undefined]
  ? { input?: BackgroundApiInterface[M]['input'] }
  : { input: BackgroundApiInterface[M]['input'] })

export type BackgroundApiRequest<M extends BackgroundApiMethodName> =
  BackgroundApiMessageKey & BackgroundApiCall<M>

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
  'id' in message &&
  'sourceId' in message &&
  message.sourceId === getBackgroundApiMessageSourceId(source)
