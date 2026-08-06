/**
 * One sample of a price series: ms-epoch timestamp and price in the
 * requested fiat currency.
 */
export type MarketChartPoint = {
  timestamp: number
  price: number
}

/**
 * Series with fewer real samples than this are treated as unusable and the
 * chart is hidden rather than inflated into a plausible-looking line.
 */
export const minimumUsableMarketChartPoints = 10

/**
 * Number of samples every series is resampled to before rendering, so all
 * ranges yield the same mark count regardless of what the free CoinGecko
 * tier returned (~170 points for 1D up to ~4800 for ALL).
 */
export const marketChartPointCount = 200

/**
 * Decodes the `prices` pairs of a CoinGecko `market_chart` response into a
 * clean ascending series. Malformed pairs (short, null, non-finite, or
 * non-positive price) are dropped rather than failing the whole series, and
 * duplicate timestamps collapse to the last occurrence.
 */
export const parseMarketChartPoints = (
  rawPairs: (number | null)[][]
): MarketChartPoint[] => {
  const parsed: MarketChartPoint[] = []

  rawPairs.forEach(pair => {
    if (pair.length < 2) return
    const [timestamp, price] = pair
    if (timestamp === null || price === null) return
    if (!Number.isFinite(timestamp) || !Number.isFinite(price)) return
    if (price <= 0) return

    parsed.push({ timestamp, price })
  })

  parsed.sort((a, b) => a.timestamp - b.timestamp)

  const result: MarketChartPoint[] = []
  parsed.forEach(point => {
    const last = result[result.length - 1]
    if (last && last.timestamp === point.timestamp) {
      result[result.length - 1] = point
    } else {
      result.push(point)
    }
  })

  return result
}

type ResampleMarketChartInput = {
  points: MarketChartPoint[]
  count?: number
}

/**
 * Resamples a series onto an evenly-spaced-in-time grid of exactly `count`
 * samples via linear interpolation, carrying the first and last source
 * samples over untouched. Upsamples as well as downsamples, so every range
 * renders the same number of marks and range switches morph in place.
 */
export const resampleMarketChart = ({
  points,
  count = marketChartPointCount,
}: ResampleMarketChartInput): MarketChartPoint[] => {
  if (count <= 1 || points.length <= 1) return points

  const opening = points[0]
  const closing = points[points.length - 1]
  const span = closing.timestamp - opening.timestamp
  if (span <= 0) return points

  const samples: MarketChartPoint[] = [opening]

  // The source samples bracketing the instant being solved for. Both the
  // grid and the series ascend, so this only ever walks forwards.
  let cursor = 0

  for (let position = 1; position < count - 1; position++) {
    const instant = opening.timestamp + (span * position) / (count - 1)

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

    samples.push({
      timestamp: instant,
      price: start.price + (end.price - start.price) * fraction,
    })
  }

  samples.push(closing)

  return samples
}

const domainHeadroom = 0.08

/**
 * Vertical [min, max] window the chart is drawn in: the price extent plus 8%
 * headroom so the line never touches the card edges. A flat series
 * (stablecoin) gets a ±5% (or ±1) pad instead of a zero-height domain.
 */
export const getMarketChartPriceDomain = (
  points: MarketChartPoint[]
): [number, number] => {
  if (points.length === 0) return [0, 1]

  const prices = points.map(({ price }) => price)
  const lowest = Math.min(...prices)
  const highest = Math.max(...prices)
  const span = highest - lowest

  if (span <= 0) {
    const padding = Math.abs(lowest) * 0.05
    const inset = padding > 0 ? padding : 1
    return [lowest - inset, highest + inset]
  }

  const inset = span * domainHeadroom

  return [lowest - inset, highest + inset]
}

/**
 * Signed relative change between the series' endpoints (0.05 == +5%), or
 * null when the series is too short to have two endpoints.
 */
export const getMarketChartChangeFraction = (
  points: MarketChartPoint[]
): number | null => {
  if (points.length < 2) return null

  const first = points[0].price
  const last = points[points.length - 1].price
  if (first === 0) return null

  return (last - first) / Math.abs(first)
}
