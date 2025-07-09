import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { QueryClientConfig } from '@tanstack/query-core'

import { queryKeyHashFn } from './utils/queryKeyHashFn'

export const queryClientGcTime = convertDuration(1, 'd', 'ms')

export const queryClientDefaultOptions: QueryClientConfig['defaultOptions'] = {
  queries: {
    gcTime: queryClientGcTime,
    queryKeyHashFn,
    retry: (failureCount, error) => {
      if (error instanceof NotImplementedError) {
        return false
      }

      return failureCount < 3
    },
  },
}
