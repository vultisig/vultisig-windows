import { useEffect } from 'react'

import { shouldDropSwapRouteOverride } from '../queries/activeSwapRoute'
import { useSwapQuotesQuery } from '../queries/useSwapQuoteQuery'
import { useSwapQuoteRequestId } from '../queries/useSwapQuoteRequestId'
import { useSwapRouteOverride } from './routeOverride'

/**
 * Discards a manual route pick once it stops applying. Mounted once inside the
 * override provider so the stored pick never contradicts the `Auto` the form is
 * already showing — leaving it in place is what let an edit back to the earlier
 * swap, or a provider reappearing after one failed quote, silently resurrect a
 * pick the user had seen dropped.
 */
export const SwapRouteOverrideReset = () => {
  const quotes = useSwapQuotesQuery().data
  const requestId = useSwapQuoteRequestId()
  const [override, setOverride] = useSwapRouteOverride()

  useEffect(() => {
    if (shouldDropSwapRouteOverride({ quotes, override, requestId })) {
      setOverride(null)
    }
  }, [override, quotes, requestId, setOverride])

  return null
}
