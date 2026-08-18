import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { SwapQuoteProviderName } from '@vultisig/core-chain/swap/quote/findSwapQuote'

/**
 * A route the user picked by hand instead of taking the auto-selected winner,
 * tied to the quote cycle it was picked from. Deliberately kept out of the
 * persisted advanced settings: a pick is valid for one cycle only and must not
 * survive a quote refresh.
 */
export type SwapRouteOverride = {
  providerName: SwapQuoteProviderName
  /**
   * Identifies the quote cycle the pick belongs to. Once the cycle changes the
   * pick stops applying, so no explicit reset has to be wired into every code
   * path that can trigger a refresh.
   */
  cycleId: string
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
