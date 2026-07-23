import { useQuery } from '@tanstack/react-query'

import { featureFlags } from '../../../../featureFlags'
import { fetchLimitSwapSupportedChains } from '../supportedChains'

const limitSwapSupportedChainsQueryKey = ['limitSwapSupportedChains']

/**
 * Chains a limit order can currently be placed from or to, after applying
 * THORChain's live halt and trading-pause flags.
 *
 * Filters the coin pickers so a user cannot select a chain whose memo could not
 * be built or whose inbound is halted.
 */
export const useLimitSwapSupportedChainsQuery = () =>
  useQuery({
    queryKey: limitSwapSupportedChainsQueryKey,
    queryFn: fetchLimitSwapSupportedChains,
    enabled: featureFlags.limitSwap,
    staleTime: 60_000,
  })
