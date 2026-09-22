import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'

/** Slack above and below the fitted window, so nothing touches the frame. */
const domainHeadroom = 0.06

/** Vertical window the limit chart is drawn in, in buy units per sell unit. */
type LimitChartDomain = {
  min: number
  max: number
}

type GetLimitChartDomainInput = {
  points: MarketChartPoint[]
  /** Undefined while the pair's quote is still resolving. */
  marketPrice: number | undefined
}

/**
 * Vertical window for the limit chart: the charted history plus the market
 * rate, with headroom, so the series fills the plot whatever the range. The
 * target never enters it — a dragged rule would otherwise rescale the plot
 * under the pointer — so a target outside the window is pinned to the edge by
 * `getLimitChartPlacement` rather than fitted.
 */
export const getLimitChartDomain = ({
  points,
  marketPrice,
}: GetLimitChartDomainInput): LimitChartDomain => {
  const bounds = points.map(({ price }) => price)

  if (marketPrice !== undefined && marketPrice > 0) {
    bounds.push(marketPrice)
  }

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
 * is pinned, and `offScale` tells the chart to draw it as a limit of the plot
 * rather than pretending it sits on the edge.
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
