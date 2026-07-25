import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'

import { LimitOrderReviewData } from '../limit/LimitOrderReview'

/**
 * What the swap form hands off to the verify step.
 *
 * A discriminated union so the limit flow reaches its review screen through the
 * same `ValueTransfer` that unmounts the form (header + Market/Limit tabs) —
 * rather than nesting a second header inside the still-mounted form.
 */
export type SwapFlowResult =
  | { kind: 'market'; quote: SwapQuote }
  | { kind: 'limit'; order: LimitOrderReviewData }
