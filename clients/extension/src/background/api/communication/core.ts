import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'

type BackgroundApiMessageSource = 'inpage' | 'background'

type BackgroundApiMessageKey = {
  id: string
  sourceId: BackgroundApiMessageSource
}

export const getBackgroundApiMessageSourceId = (
  source: BackgroundApiMessageSource
) => `${productName}-${source}`

export type BackgroundApiRequest<M extends BackgroundApiMethodName> =
  BackgroundApiMessageKey & {
    method: M
    input: BackgroundApiInterface[M]['input']
  }

export type BackgroundApiResponse<M extends BackgroundApiMethodName> =
  BackgroundApiMessageKey & {
    result: Result<BackgroundApiInterface[M]['output']>
  }

export const isBackgroundApiMessage = <T extends BackgroundApiMessageKey>(
  message: unknown,
  sourceId: BackgroundApiMessageSource
): message is T =>
  typeof message === 'object' &&
  message !== null &&
  'id' in message &&
  'sourceId' in message &&
  message.sourceId === sourceId
