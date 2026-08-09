import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

const bpsPerUnit = 10_000
const percentFractionDigits = 2

// Bands mirror iOS `SwapCryptoLogic.priceImpactColor`, applied to the
// display-oriented impact: better than -1% is good, better than -3% average.
const goodThreshold = -0.01
const averageThreshold = -0.03

export type PriceImpactLevel = 'good' | 'average' | 'high'

type PriceImpactDisplay = {
  percent: string
  level: PriceImpactLevel
}

/**
 * Fractional price impact of a quote (`0.0133` == 1.33% of output lost), or
 * `undefined` when the provider does not report one.
 *
 * Native quotes carry it as `slippage_bps`. General quotes only expose it for
 * providers that publish it — the EVM aggregators do not, so their row is
 * hidden rather than filled with the total-fee bps, which is a different figure
 * that merely looks like slippage.
 */
export const getSwapPriceImpact = (
  quote: SwapQuoteResult
): number | undefined =>
  matchRecordUnion<SwapQuoteResult, number | undefined>(quote, {
    native: ({ slippage_bps: slippageBps }) =>
      slippageBps === undefined ? undefined : slippageBps / bpsPerUnit,
    general: ({ priceImpact }) => priceImpact,
  })

/**
 * Formats a fractional price impact as a signed percentage and its quality
 * tier. The provider reports impact as a cost, so the value is negated for
 * display and given an explicit sign — a swap that gains the user output reads
 * `+0.39%`, one that costs them reads `-1.33%`.
 */
export const formatPriceImpact = (
  impact: number | undefined
): PriceImpactDisplay | undefined => {
  if (impact === undefined) return undefined

  const displayImpact = -impact
  const percentValue = Number(
    (displayImpact * 100).toFixed(percentFractionDigits)
  )
  const sign = percentValue < 0 ? '' : '+'

  return {
    percent: `${sign}${percentValue.toFixed(percentFractionDigits)}%`,
    level:
      displayImpact > goodThreshold
        ? 'good'
        : displayImpact > averageThreshold
          ? 'average'
          : 'high',
  }
}
