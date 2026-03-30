import { QueryClientConfig } from '@tanstack/query-core'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

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
