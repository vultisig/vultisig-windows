import type { FindSwapQuoteInput } from '@vultisig/core-chain/swap/quote/findSwapQuote'

/**
 * Providers that the Windows/extension keysign path cannot execute safely.
 *
 * Keep this list on every product quote entry point so an unsupported route is
 * removed before fetch and ranking, rather than failing after user review.
 */
export const clientSwapQuoteProviderExclusions = [
  'CowSwap',
] satisfies NonNullable<FindSwapQuoteInput['excludeProviders']>
