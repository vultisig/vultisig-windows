import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { SwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/findSwapQuote'

/**
 * A route the user picked by hand instead of taking the auto-selected winner,
 * scoped to the swap it was picked for. Deliberately kept out of the persisted
 * advanced settings: a pick belongs to the swap being composed right now, not
 * to the vault's saved preferences.
 */
export type SwapRouteOverride = {
  providerName: SwapQuoteProviderName
  /**
   * The swap the pick was made for — see `getSwapQuoteRequestId`. The pick
   * holds across every re-quote of that same pair and amount, including the
   * interval refresh, and stops applying once either changes.
   */
  requestId: string
}

/**
 * Holds the {@link SwapRouteOverride} for the swap flow. Mounted alongside the
 * other swap form state so the pick reaches the verify screen the form hands
 * its quote to. Declared without a default so the "nothing picked" `null` is
 * supplied at the mount site — `setupStateProvider` asserts its own default is
 * present and would reject `null`.
 */
export const [SwapRouteOverrideProvider, useSwapRouteOverride] =
  setupStateProvider<SwapRouteOverride | null>('SwapRouteOverride')
