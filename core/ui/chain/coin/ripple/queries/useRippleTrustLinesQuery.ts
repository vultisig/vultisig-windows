import { useQuery } from '@tanstack/react-query'
import { getRippleAccountLines } from '@vultisig/core-chain/chains/ripple/account/lines'
import { attempt } from '@vultisig/lib-utils/attempt'
import { isInError } from '@vultisig/lib-utils/error/isInError'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { RippleTrustLine } from '../trustLine'

/**
 * Every trust line the XRPL account at `address` holds.
 *
 * An unfunded account has no AccountRoot and so holds no lines — that is an
 * empty set, not a failure. Every other error propagates: reporting "no lines"
 * for a node hiccup would tell the user to open a line they already have.
 */
export const useRippleTrustLinesQuery = (address: string) =>
  useQuery({
    queryKey: ['rippleTrustLines', address],
    queryFn: async (): Promise<RippleTrustLine[]> => {
      const result = await attempt(getRippleAccountLines(address))

      if ('error' in result) {
        if (isInError(result.error, 'Account not found', 'actNotFound')) {
          return []
        }

        throw result.error
      }

      return result.data
    },
    enabled: !!address,
    staleTime: convertDuration(1, 'min', 'ms'),
  })
