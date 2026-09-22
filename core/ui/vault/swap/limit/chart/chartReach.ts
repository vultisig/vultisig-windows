import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * Whether the pair has actually traded at the target price inside the charted
 * window — the one question a limit price raises that a line alone cannot
 * answer.
 */
export type LimitChartReach =
  | { belowMarket: true }
  | { lastTraded: number }
  | { notReached: number }

type GetLimitChartReachInput = {
  points: MarketChartPoint[]
  targetPrice: number
  /** Undefined while the pair's quote is still resolving. */
  marketPrice: number | undefined
}

/**
 * Reads the verdict off the charted series.
 *
 * Below market needs no history: such an order fills more or less on arrival.
 * At market or above, the answer is the **last** crossing — walking back from
 * the newest sample, since what matters is how recently the price was there,
 * not the first time it ever was. The crossing instant is interpolated between
 * the bracketing samples rather than snapped to one, so a coarse ALL series
 * does not report a crossing days off. A target sitting exactly at market is
 * read off the series like any other, so the rule an untouched form draws
 * there says when the pair was last at that price rather than calling it an
 * immediate fill.
 *
 * Returns `null` when there is no series to read.
 */
export const getLimitChartReach = ({
  points,
  targetPrice,
  marketPrice,
}: GetLimitChartReachInput): LimitChartReach | null => {
  if (points.length === 0 || targetPrice <= 0) {
    return null
  }

  if (
    marketPrice !== undefined &&
    marketPrice > 0 &&
    targetPrice < marketPrice
  ) {
    return { belowMarket: true }
  }

  const lastReachedIndex = points.reduce(
    (found, { price }, index) => (price >= targetPrice ? index : found),
    -1
  )

  if (lastReachedIndex === -1) {
    return { notReached: Math.max(...points.map(({ price }) => price)) }
  }

  const reached = points[lastReachedIndex]
  const next = points[lastReachedIndex + 1]

  if (!next) {
    return { lastTraded: reached.timestamp }
  }

  // The series crossed back down between these two samples; solve for where.
  const drop = reached.price - next.price
  const fraction = drop > 0 ? (reached.price - targetPrice) / drop : 0

  return {
    lastTraded:
      reached.timestamp + fraction * (next.timestamp - reached.timestamp),
  }
}

/** The `Text` colour names a verdict can be drawn in. */
export type LimitChartReachColor = 'success' | 'danger' | 'shy'

/**
 * The colour a verdict is drawn in — shared by the rule on the chart and the
 * caption under it, so the two can never disagree.
 */
export const getLimitChartReachColor = (
  reach: LimitChartReach
): LimitChartReachColor =>
  matchRecordUnion<LimitChartReach, LimitChartReachColor>(reach, {
    belowMarket: () => 'danger',
    lastTraded: () => 'success',
    notReached: () => 'shy',
  })
