import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'

import { LimitOrderReviewData } from '../limit/LimitOrderReview'

/**
 * What the swap form hands off to the review step.
 *
 * A discriminated union because the two modes review differently: a market
 * swap opens a sheet over the still-mounted form, while a limit order unmounts
 * the form (header + Market/Limit tabs) for a review page of its own — rather
 * than nesting a second header inside the form.
 */
export type SwapFlowResult =
  | { kind: 'market'; quote: SwapQuote }
  | { kind: 'limit'; order: LimitOrderReviewData }
