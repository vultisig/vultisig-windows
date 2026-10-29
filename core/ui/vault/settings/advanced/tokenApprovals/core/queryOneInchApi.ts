import { rootApiUrl } from '@vultisig/core-config'
import { HttpResponseError } from '@vultisig/lib-utils/fetch/HttpResponseError'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { retry } from '@vultisig/lib-utils/query/retry'

type QueryOneInchApiInput = {
  path: string
  body?: unknown
}

/**
 * Calls a 1inch endpoint through the Vultisig proxy, retrying when the
 * plan's rate limit answers 429.
 */
export const queryOneInchApi = <T>({ path, body }: QueryOneInchApiInput) =>
  retry({
    func: () => queryUrl<T>(`${rootApiUrl}/1inch${path}`, { body }),
    attempts: 5,
    delay: 1000,
    shouldRetry: error =>
      error instanceof HttpResponseError && error.status === 429,
  })
