import { rootApiUrl } from '@vultisig/core-config'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { MarketChartPoint, parseMarketChartPoints } from './marketChart'
import { MarketChartRange, marketChartRangeDays } from './MarketChartRange'
import { MarketDataSource } from './MarketDataSource'

const baseUrl = `${rootApiUrl}/coingeicko/api/v3/coins`

type MarketChartResponse = {
  prices: (number | null)[][]
}

type GetCoinMarketChartInput = {
  source: MarketDataSource
  fiatCurrency: FiatCurrency
  range: MarketChartRange
}

/**
 * Fetches a coin's price series from the CoinGecko proxy via the id or
 * contract `market_chart` endpoint. No `interval` param is sent — it is
 * paid-only, and the free tier infers granularity from `days`. Returns a
 * cleaned ascending series; caps/volumes are not requested from this
 * endpoint since stats come from `/coins/markets`.
 */
export const getCoinMarketChart = async ({
  source,
  fiatCurrency,
  range,
}: GetCoinMarketChartInput): Promise<MarketChartPoint[]> => {
  const path = matchRecordUnion<MarketDataSource, string>(source, {
    id: id => `${baseUrl}/${id.toLowerCase()}/market_chart`,
    contract: ({ platform, address }) =>
      `${baseUrl}/${platform.toLowerCase()}/contract/${address.toLowerCase()}/market_chart`,
  })

  const url = addQueryParams(path, {
    vs_currency: fiatCurrency,
    days: marketChartRangeDays[range],
  })

  const { prices } = await queryUrl<MarketChartResponse>(url)

  return parseMarketChartPoints(prices)
}
