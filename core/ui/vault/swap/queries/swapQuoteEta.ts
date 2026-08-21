import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * The provider's own end-to-end estimate for a route, in seconds. Only native
 * swap chains publish one; general aggregators expose nothing comparable, so
 * the UI omits the segment rather than guessing at a number.
 */
export const getSwapQuoteEtaSeconds = (
  quote: SwapQuoteResult
): number | undefined =>
  matchRecordUnion<SwapQuoteResult, number | undefined>(quote, {
    native: ({ total_swap_seconds }) => total_swap_seconds,
    general: () => undefined,
  })
