import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { blockaidBaseUrl } from '../../../config'

export const queryBlockaid = async <T>(
  route: `/${string}`,
  body: unknown
): Promise<T> =>
  queryUrl<T>(`${blockaidBaseUrl}${route}`, {
    body,
    headers: {
      origin: rootApiUrl,
    },
  })
