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
  slippageTolerance: number | undefined
  recipient: string | undefined
}

/**
 * Identifies the swap the user is quoting — the inputs the quote is requested
 * with, and nothing about the quotes that came back. A manual route pick is
 * scoped to this, so re-quoting the same swap re-ranks the routes without
 * moving the user off the one they chose, while editing any input is a
 * different swap and starts the choice over.
 *
 * Covers the editable fields `buildSwapQuoteInput` sends, and takes the derived
 * values rather than the raw form state so an edit that leaves the request
 * unchanged — a whitespace-only recipient, a custom slippage that still
 * resolves to `Auto` — keeps the pick. The referral and discount tier it also
 * sends are deliberately left out: they are fetched rather than edited, and
 * including them would retire the pick when a background query resolves.
 */
export const getSwapQuoteRequestId = ({
  from,
  to,
  amount,
  slippageTolerance,
  recipient,
}: SwapQuoteRequestIdInput) =>
  [
    coinKeyToString(from),
    coinKeyToString(to),
    amount ?? '',
    slippageTolerance ?? '',
    recipient ?? '',
  ].join('>')

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

type ShouldDropSwapRouteOverrideInput = {
  quotes: FindSwapQuotesResult | undefined
  override: SwapRouteOverride | null
  requestId: string
}

/**
 * Whether a stored pick should be discarded outright rather than merely
 * ignored. A pick that has stopped applying but stays in state comes back on
 * its own once the user edits the swap back to what it was, or once the
 * provider returns to the candidate set — both after the form has already shown
 * `Auto`. Dropping it as soon as it stops matching what the form displays keeps
 * the stored pick and the visible one from disagreeing.
 *
 * Returns `false` while quotes are still loading, so a pick is never discarded
 * over a candidate set that has not arrived yet.
 */
export const shouldDropSwapRouteOverride = ({
  quotes,
  override,
  requestId,
}: ShouldDropSwapRouteOverrideInput): boolean => {
  if (!override) {
    return false
  }

  if (override.requestId !== requestId) {
    return true
  }

  return quotes
    ? getActiveSwapRouteOverride({ quotes, override, requestId }) === null
    : false
}
