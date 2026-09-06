import { SwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/findSwapQuote'

import { useSwapRouteOverride } from '../state/routeOverride'
import {
  canSelectSwapRoute,
  getActiveSwapRouteOverride,
  resolveActiveSwapRoute,
} from './activeSwapRoute'
import { useSwapQuotesQuery } from './useSwapQuoteQuery'
import { useSwapQuoteRequestId } from './useSwapQuoteRequestId'

/**
 * Every route the current quote cycle offers, which one the swap is going
 * through, and how to switch to another. A pick holds for as long as the user
 * keeps quoting the same pair and amount — refreshes re-rank the routes around
 * it — and is dropped once they edit either, or once the picked provider stops
 * quoting.
 */
export const useSwapRoutes = () => {
  const quotes = useSwapQuotesQuery().data
  const [override, setOverride] = useSwapRouteOverride()
  const requestId = useSwapQuoteRequestId()

  const candidates = quotes?.ranked ?? []

  return {
    candidates,
    canSelectRoute: canSelectSwapRoute(candidates),
    activeRoute: quotes
      ? resolveActiveSwapRoute({ quotes, override, requestId })
      : null,
    isOverridden: quotes
      ? getActiveSwapRouteOverride({ quotes, override, requestId }) !== null
      : false,
    selectRoute: (providerName: SwapQuoteProviderName) =>
      setOverride({ providerName, requestId }),
  }
}
