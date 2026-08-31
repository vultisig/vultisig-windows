import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * A linear fit of what one pair pays out, taken from a single firm quote:
 * `output = amount * rate * (1 - proportionalFeeFraction) - flatFee`.
 *
 * Every term comes from the quote itself, never from the price oracle, so the
 * fit does not drift as spot prices move and cannot absorb the gap between
 * oracle prices and pool prices as if it were a fee.
 */
export type SwapPayoutModel = {
  /** Destination units per source unit, gross of fees. */
  rate: number
  /** Share of the gross output withheld by fees that scale with trade size. */
  proportionalFeeFraction: number
  /** Destination units withheld regardless of trade size. */
  flatFee: number
}

/**
 * A fit whose proportional fee reaches this share of the gross output is not
 * describing a swap anyone would take, so it is treated as unreadable and the
 * caller falls back to spot rather than rendering a number derived from it.
 */
const implausibleProportionalFeeFraction = 0.5

const parseChainAmount = (value: string, decimals: number): number | null => {
  const parsed = fromChainAmount(value, decimals)

  return Number.isFinite(parsed) ? parsed : null
}

type GetSwapPayoutModelInput = {
  quote: SwapQuoteResult
  input: number
  toCoinKey: CoinKey
  toCoinDecimals: number
}

/**
 * Fits {@link SwapPayoutModel} to a settled quote, or `null` when the quote
 * does not carry readable amounts.
 *
 * Native quotes report a fee breakdown, so the flat part (the protocol's
 * outbound fee) is separated from the parts that scale with trade size
 * (liquidity and affiliate) and the two are re-applied on their own terms.
 * Aggregator quotes report only a net payout, so the whole cost folds into the
 * rate — proportional by construction, which is the safe assumption when the
 * split is unknown.
 */
export const getSwapPayoutModel = ({
  quote,
  input,
  toCoinKey,
  toCoinDecimals,
}: GetSwapPayoutModelInput): SwapPayoutModel | null => {
  if (!(input > 0)) {
    return null
  }

  return matchRecordUnion<SwapQuoteResult, SwapPayoutModel | null>(quote, {
    native: ({ expected_amount_out, fees }) => {
      const decimals = getNativeSwapDecimals(toCoinKey)
      const output = parseChainAmount(expected_amount_out, decimals)
      const total = parseChainAmount(fees.total, decimals)
      const outbound = parseChainAmount(fees.outbound, decimals)

      if (output === null || total === null || outbound === null) {
        return null
      }

      const gross = output + total
      if (!(gross > 0)) {
        return null
      }

      const proportionalFeeFraction = Math.max(total - outbound, 0) / gross
      if (proportionalFeeFraction >= implausibleProportionalFeeFraction) {
        return null
      }

      return {
        rate: gross / input,
        proportionalFeeFraction,
        flatFee: Math.max(outbound, 0),
      }
    },
    general: ({ dstAmount }) => {
      const output = parseChainAmount(dstAmount, toCoinDecimals)

      if (output === null || !(output > 0)) {
        return null
      }

      return {
        rate: output / input,
        proportionalFeeFraction: 0,
        flatFee: 0,
      }
    },
  })
}

type GetSwapPayoutEstimateInput = {
  amount: number
  model: SwapPayoutModel
}

/**
 * The payout the fitted model predicts for a source amount. Exact at the
 * amount the model was fitted to, and linear in between, so a change of amount
 * moves the estimate by a bounded amount rather than by whatever the last
 * quote happened to be sized at.
 *
 * Floors at zero: below the flat fee the trade really does pay out nothing,
 * and the protocol declines to route it.
 */
export const getSwapPayoutEstimate = ({
  amount,
  model,
}: GetSwapPayoutEstimateInput): number =>
  Math.max(
    amount * model.rate * (1 - model.proportionalFeeFraction) - model.flatFee,
    0
  )
