import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'

import { limitPricePresets } from '../price'

/**
 * Floor and ceiling of the plot, as multiples of the market rate. The ceiling
 * clears the furthest preset stop so every pill lands inside the plot; the
 * floor keeps just enough room below market for the at-or-below-market region
 * to read as a region rather than an edge.
 */
const domainFloorMultiplier = 0.97
const domainCeilingMultiplier = 1.12

/** Slack above and below the anchored window, so nothing touches the frame. */
const domainHeadroom = 0.06

/**
 * The preset stops drawn as guide lines: the two furthest-above-market pills.
 * Derived from the preset list so a change there moves the guides with it.
 */
export const limitChartGuidePresets = limitPricePresets.slice(-2)

/** Vertical window the limit chart is drawn in, in buy units per sell unit. */
type LimitChartDomain = {
  min: number
  max: number
}

type GetLimitChartDomainInput = {
  points: MarketChartPoint[]
  marketPrice: number
}

/**
 * Vertical window for the limit chart, anchored on the **market rate** rather
 * than on the data or the target: the drag zone a limit order cares about is a
 * few percent around market, and a domain fitted to the history would rescale
 * the moment the range changed. The series only ever widens the window, and the
 * target never enters it — so dragging cannot make the plot move under the
 * pointer.
 */
export const getLimitChartDomain = ({
  points,
  marketPrice,
}: GetLimitChartDomainInput): LimitChartDomain => {
  const prices = points.map(({ price }) => price)

  const anchors =
    marketPrice > 0
      ? [
          marketPrice * domainFloorMultiplier,
          marketPrice * domainCeilingMultiplier,
        ]
      : []

  const bounds = [...prices, ...anchors]
  if (bounds.length === 0) {
    return { min: 0, max: 1 }
  }

  const low = Math.min(...bounds)
  const high = Math.max(...bounds)
  const span = high - low

  if (span <= 0) {
    const inset = Math.abs(low) * domainHeadroom || 1
    return { min: low - inset, max: high + inset }
  }

  const inset = span * domainHeadroom

  return { min: low - inset, max: high + inset }
}

type LimitChartFractionInput = {
  value: number
  domain: LimitChartDomain
}

/**
 * Where a price sits in the plot as a top-down fraction (0 is the top edge).
 * Unclamped, so callers can tell an off-scale target from one on the edge.
 */
export const getLimitChartFraction = ({
  value,
  domain,
}: LimitChartFractionInput): number => {
  const span = domain.max - domain.min

  return span > 0 ? (domain.max - value) / span : 0.5
}

type LimitChartValueInput = {
  fraction: number
  domain: LimitChartDomain
}

/** The price a top-down fraction of the plot points at — the drag's inverse. */
export const getLimitChartValue = ({
  fraction,
  domain,
}: LimitChartValueInput): number =>
  domain.max - fraction * (domain.max - domain.min)

/**
 * Where a target price is drawn, and whether it had to be pinned to get there.
 * A target outside the window keeps its value everywhere else — only its mark
 * is pinned, and `offScale` tells the chart to label it instead of pretending
 * it sits on the edge.
 */
type LimitChartPlacement = {
  fraction: number
  offScale: 'above' | 'below' | undefined
}

/** Placement of a price within the plot, pinned to the edge when off-scale. */
export const getLimitChartPlacement = ({
  value,
  domain,
}: LimitChartFractionInput): LimitChartPlacement => {
  const fraction = getLimitChartFraction({ value, domain })

  return {
    fraction: Math.min(1, Math.max(0, fraction)),
    offScale:
      value > domain.max ? 'above' : value < domain.min ? 'below' : undefined,
  }
}
