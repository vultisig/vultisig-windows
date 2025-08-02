import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'

type BackgroundApiMessageSource = 'inpage' | 'content' | 'background'

export const getBackgroundApiMessageSourceId = (
  source: BackgroundApiMessageSource
) => `${productName}-${source}`

export type BackgroundApiRequest<M extends BackgroundApiMethodName> = {
  id: string
  sourceId: BackgroundApiMessageSource
  method: M
  input: BackgroundApiInterface[M]['input']
}

export type BackgroundApiResponse<M extends BackgroundApiMethodName> = {
  id: string
  sourceId: BackgroundApiMessageSource
  result: Result<BackgroundApiInterface[M]['output']>
}
