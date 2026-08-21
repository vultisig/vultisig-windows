import {
  FindSwapQuotesResult,
  SwapQuoteCandidate,
} from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { BoundSwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'

import { SwapRouteOverride } from '../state/routeOverride'

/**
 * Identifies one quote cycle. The winner's safety fingerprint covers the pair,
 * the requested amount, the quote itself and its expiry, so every refresh —
 * interval, manual, or a pair/amount edit — yields a different id and retires
 * the manual route pick made against the previous one.
 */
export const getSwapQuoteCycleId = ({ best }: FindSwapQuotesResult) =>
  best.safetyFingerprint

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
}

/**
 * The manual route pick that still applies to this quote cycle, or `null` when
 * the user never picked one, the pick belongs to an earlier cycle, or its
 * provider dropped out of the current candidate set.
 */
export const getActiveSwapRouteOverride = ({
  quotes,
  override,
}: ActiveSwapRouteInput): SwapRouteOverride | null => {
  if (!override || override.cycleId !== getSwapQuoteCycleId(quotes)) {
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
 * when one is in effect, otherwise the auto-selected winner. `null` only if the
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
