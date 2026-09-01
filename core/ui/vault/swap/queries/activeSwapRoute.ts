import { CoinKey, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import {
  FindSwapQuotesResult,
  SwapQuoteCandidate,
} from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { BoundSwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'

import { SwapRouteOverride } from '../state/routeOverride'

type SwapQuoteRequestIdInput = {
  from: CoinKey
  to: CoinKey
  amount: bigint | null
}

/**
 * Identifies the swap the user is quoting — the pair and the amount, and
 * nothing about the quotes that came back. A manual route pick is scoped to
 * this, so re-quoting the same swap re-ranks the routes without moving the user
 * off the one they chose, while editing the pair or the amount is a new swap
 * and starts the choice over.
 */
export const getSwapQuoteRequestId = ({
  from,
  to,
  amount,
}: SwapQuoteRequestIdInput) =>
  [coinKeyToString(from), coinKeyToString(to), amount ?? ''].join('>')

/**
 * Whether there is a route choice worth offering. Candidate count is the only
 * condition: the Advanced Swap sheet that hosts the picker is already tier
 * gated at its entry point, and a lone candidate is not a choice.
 */
export const canSelectSwapRoute = (candidates: SwapQuoteCandidate[]) =>
  candidates.length > 1

type ActiveSwapRouteInput = {
  quotes: FindSwapQuotesResult
  override: SwapRouteOverride | null
  requestId: string
}

/**
 * The manual route pick that still applies, or `null` when the user never
 * picked one, the pick was made for a different swap, or its provider dropped
 * out of the current candidate set.
 */
export const getActiveSwapRouteOverride = ({
  quotes,
  override,
  requestId,
}: ActiveSwapRouteInput): SwapRouteOverride | null => {
  if (!override || override.requestId !== requestId) {
    return null
  }

  return quotes.ranked.some(
    ({ providerName }) => providerName === override.providerName
  )
    ? override
    : null
}

/**
 * The candidate the swap is currently going through: the manually picked route
 * when one is in effect, otherwise the auto-selected winner. Always resolved
 * against the candidates of the latest quote cycle, so a pick selects a
 * provider rather than pinning the quote it was picked from. `null` only if the
 * winner is somehow absent from the candidate set, which the SDK never returns.
 */
export const resolveActiveSwapRoute = (
  input: ActiveSwapRouteInput
): SwapQuoteCandidate | null => {
  const { ranked, best } = input.quotes
  const override = getActiveSwapRouteOverride(input)

  const activeCandidate = override
    ? ranked.find(({ providerName }) => providerName === override.providerName)
    : ranked.find(
        ({ quote }) => quote.safetyFingerprint === best.safetyFingerprint
      )

  return activeCandidate ?? null
}

/**
 * {@link resolveActiveSwapRoute} as the bound quote that drives the form, the
 * verify screen and the keysign payload, so a non-default pick reaches the
 * signed transaction.
 */
export const resolveActiveSwapQuote = (
  input: ActiveSwapRouteInput
): BoundSwapQuote => resolveActiveSwapRoute(input)?.quote ?? input.quotes.best
