import {
  MarketChartPoint,
  marketChartPointCount,
  minimumUsableMarketChartPoints,
} from '@core/ui/chain/coin/price/market/marketChart'

/**
 * How much of the shorter leg's window the two legs must share before their
 * ratio is drawable. Below this the ratio would be stitched from stretches
 * where only one leg actually has history.
 */
const minimumOverlapFraction = 0.9

/**
 * How far apart the legs' newest samples may sit, as a fraction of the
 * shorter window. A freshly fetched leg over a stale cached one draws a
 * plausible-looking move at the right edge that never happened.
 */
const maximumClosingSkewFraction = 0.1

const isUsableLeg = (points: MarketChartPoint[]): boolean =>
  points.length >= minimumUsableMarketChartPoints &&
  points.every(
    ({ timestamp, price }) =>
      Number.isFinite(timestamp) && Number.isFinite(price) && price > 0
  )

const getSpan = (points: MarketChartPoint[]): number =>
  points[points.length - 1].timestamp - points[0].timestamp

type SampleLegInput = {
  points: MarketChartPoint[]
  instants: number[]
}

/**
 * Linearly interpolates a leg at each instant. Both the leg and the instants
 * ascend and every instant lies inside the leg's window, so the bracketing
 * cursor only ever walks forwards.
 */
const sampleLeg = ({ points, instants }: SampleLegInput): number[] => {
  let cursor = 0

  return instants.map(instant => {
    while (
      cursor + 2 < points.length &&
      points[cursor + 1].timestamp <= instant
    ) {
      cursor++
    }

    const start = points[cursor]
    const end = points[cursor + 1]
    const interval = end.timestamp - start.timestamp
    const fraction = interval > 0 ? (instant - start.timestamp) / interval : 0

    return start.price + (end.price - start.price) * fraction
  })
}

type BuildLimitPairSeriesInput = {
  /** Fiat price history of the sell asset. */
  sell: MarketChartPoint[]
  /** Fiat price history of the buy asset. */
  buy: MarketChartPoint[]
  count?: number
}

/**
 * History of the pair ratio — buy-asset units per sell-asset unit, the same
 * quantity the target price and the memo's LIM are in — derived by dividing
 * two per-coin fiat series sampled onto one shared time grid over their
 * overlap.
 *
 * Returns `null` rather than a best effort whenever the inputs cannot support
 * an honest line: either leg too sparse or carrying a non-positive sample, too
 * little shared window, or newest samples too far apart. A limit price is a
 * commitment, so a plausible-looking ratio assembled from mismatched legs is
 * worse here than no chart at all.
 */
export const buildLimitPairSeries = ({
  sell,
  buy,
  count = marketChartPointCount,
}: BuildLimitPairSeriesInput): MarketChartPoint[] | null => {
  if (!isUsableLeg(sell) || !isUsableLeg(buy)) {
    return null
  }

  const shorterSpan = Math.min(getSpan(sell), getSpan(buy))
  if (shorterSpan <= 0) {
    return null
  }

  const overlapStart = Math.max(sell[0].timestamp, buy[0].timestamp)
  const overlapEnd = Math.min(
    sell[sell.length - 1].timestamp,
    buy[buy.length - 1].timestamp
  )
  const overlap = overlapEnd - overlapStart
  if (overlap < shorterSpan * minimumOverlapFraction) {
    return null
  }

  const closingSkew = Math.abs(
    sell[sell.length - 1].timestamp - buy[buy.length - 1].timestamp
  )
  if (closingSkew > shorterSpan * maximumClosingSkewFraction) {
    return null
  }

  const sampleCount = Math.max(2, count)
  const instants = Array.from(
    { length: sampleCount },
    (_, index) => overlapStart + (overlap * index) / (sampleCount - 1)
  )

  const sellPrices = sampleLeg({ points: sell, instants })
  const buyPrices = sampleLeg({ points: buy, instants })

  return instants.map((timestamp, index) => ({
    timestamp,
    price: sellPrices[index] / buyPrices[index],
  }))
}
