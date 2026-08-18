import { SwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { useSwapRouteOverride } from '../state/routeOverride'
import {
  canSelectSwapRoute,
  getActiveSwapRouteOverride,
  getSwapQuoteCycleId,
  resolveActiveSwapRoute,
} from './activeSwapRoute'
import { useSwapQuotesQuery } from './useSwapQuoteQuery'

/**
 * Every route the current quote cycle offers, which one the swap is going
 * through, and how to switch to another. Picking a route only holds for the
 * cycle it was picked in — the next refresh re-defaults to the auto-selected
 * winner without anything having to reset it.
 */
export const useSwapRoutes = () => {
  const quotes = useSwapQuotesQuery().data
  const [override, setOverride] = useSwapRouteOverride()

  const candidates = quotes?.ranked ?? []

  return {
    candidates,
    canSelectRoute: canSelectSwapRoute(candidates),
    activeRoute: quotes ? resolveActiveSwapRoute({ quotes, override }) : null,
    isOverridden: quotes
      ? getActiveSwapRouteOverride({ quotes, override }) !== null
      : false,
    selectRoute: (providerName: SwapQuoteProviderName) =>
      setOverride({
        providerName,
        cycleId: getSwapQuoteCycleId(shouldBePresent(quotes, 'swap quotes')),
      }),
  }
}
