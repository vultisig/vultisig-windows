import { MarketChartRange } from '@core/ui/chain/coin/price/market/MarketChartRange'

const scrubDateFormatOptions: Record<
  MarketChartRange,
  Intl.DateTimeFormatOptions
> = {
  day: { hour: 'numeric', minute: 'numeric' },
  week: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
  month: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
  year: { year: 'numeric', month: 'short', day: 'numeric' },
  all: { year: 'numeric', month: 'short', day: 'numeric' },
}

type FormatMarketChartScrubDateInput = {
  timestamp: number
  range: MarketChartRange
  locale: string
}

/**
 * Formats the date caption shown while scrubbing the price chart, with
 * detail matched to the range's granularity: time-of-day for 1D, date +
 * time for 1W/1M, date only for 1Y/ALL.
 */
export const formatMarketChartScrubDate = ({
  timestamp,
  range,
  locale,
}: FormatMarketChartScrubDateInput): string =>
  new Intl.DateTimeFormat(locale, scrubDateFormatOptions[range]).format(
    new Date(timestamp)
  )
