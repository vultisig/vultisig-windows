import { useQuery } from '@tanstack/react-query'

import { featureFlags } from '../../../../featureFlags'
import { fetchAdvancedSwapQueueEnabled } from '../availability'

const advancedSwapQueueQueryKey = ['advancedSwapQueueEnabled']

/**
 * Whether THORChain is currently accepting resting limit orders.
 *
 * Refetched on an interval because the gate is a network-wide mimir that can be
 * flipped off mid-session; an order placed against a stale `true` would execute
 * as an unprotected market swap.
 */
export const useAdvancedSwapQueueEnabledQuery = () =>
  useQuery({
    queryKey: advancedSwapQueueQueryKey,
    queryFn: fetchAdvancedSwapQueueEnabled,
    enabled: featureFlags.limitSwap,
    refetchInterval: 60_000,
    staleTime: 60_000,
  })
