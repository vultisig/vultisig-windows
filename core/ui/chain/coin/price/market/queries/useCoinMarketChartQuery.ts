import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { getCoinMarketChart } from '../getCoinMarketChart'
import {
  marketChartPointCount,
  minimumUsableMarketChartPoints,
  resampleMarketChart,
} from '../marketChart'
import {
  MarketChartRange,
  marketChartRangeStaleTime,
} from '../MarketChartRange'
import { MarketDataSource } from '../MarketDataSource'

type UseCoinMarketChartQueryInput = {
  source: MarketDataSource | null
  range: MarketChartRange
  /**
   * Lets a caller hold the fetch back until the chart is actually on screen.
   * The key is unaffected, so the series is still shared with every other
   * consumer of the same coin, currency and range.
   */
  isEnabled?: boolean
}

type CoinMarketChartQueryKeyInput = {
  source: MarketDataSource | null
  fiatCurrency: FiatCurrency
  range: MarketChartRange
}

/**
 * Cache key for a coin's market chart: one entry per source, currency and
 * range, so range switches keep their own freshness windows.
 */
export const getCoinMarketChartQueryKey = (
  input: CoinMarketChartQueryKeyInput
) => ['coinMarketChart', input]

/**
 * Price series for a coin's chart, resampled to a fixed point count so range
 * switches morph in place. Resolves to `null` when the series is too sparse to
 * draw honestly. Inactive for pool-priced coins (`source` null) and while a
 * caller holds it back with `isEnabled`. Freshness follows the range (1m for
 * 1D up to 1h for 1Y/ALL); no polling — data refetches only on open or
 * range/currency change. While a new range loads, the previous series stays
 * available as placeholder data so the layout never collapses to a spinner.
 */
export const useCoinMarketChartQuery = ({
  source,
  range,
  isEnabled = true,
}: UseCoinMarketChartQueryInput) => {
  const fiatCurrency = useFiatCurrency()

  return useQuery({
    queryKey: getCoinMarketChartQueryKey({ source, fiatCurrency, range }),
    queryFn: async () => {
      const points = await getCoinMarketChart({
        source: shouldBePresent(source),
        fiatCurrency,
        range,
      })

      if (points.length < minimumUsableMarketChartPoints) {
        return null
      }

      return resampleMarketChart({ points, count: marketChartPointCount })
    },
    enabled: isEnabled && source !== null,
    placeholderData: keepPreviousData,
    ...persistQueryOptions,
    staleTime: marketChartRangeStaleTime[range],
  })
}
