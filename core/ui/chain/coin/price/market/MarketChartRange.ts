import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

/**
 * Time windows supported by the coin-detail price chart.
 */
export const marketChartRanges = [
  'day',
  'week',
  'month',
  'year',
  'all',
] as const

/**
 * A single price-chart time window (1D / 1W / 1M / 1Y / ALL).
 */
export type MarketChartRange = (typeof marketChartRanges)[number]

/**
 * Value of the CoinGecko `days` query param for each range. The free tier
 * infers granularity from it (<=1 → 5-minutely, 2–90 → hourly, >90 → daily);
 * `interval` is a paid-only param and must not be sent.
 */
export const marketChartRangeDays: Record<MarketChartRange, string> = {
  day: '1',
  week: '7',
  month: '30',
  year: '365',
  all: 'max',
}

/**
 * How long a fetched series stays fresh per range: short for the fast-moving
 * 1D window, long for the slow-moving 1Y/ALL windows.
 */
export const marketChartRangeStaleTime: Record<MarketChartRange, number> = {
  day: convertDuration(1, 'min', 'ms'),
  week: convertDuration(10, 'min', 'ms'),
  month: convertDuration(10, 'min', 'ms'),
  year: convertDuration(1, 'h', 'ms'),
  all: convertDuration(1, 'h', 'ms'),
}
