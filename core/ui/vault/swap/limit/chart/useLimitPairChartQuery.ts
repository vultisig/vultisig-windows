import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { MarketChartRange } from '@core/ui/chain/coin/price/market/MarketChartRange'
import { resolveMarketDataSource } from '@core/ui/chain/coin/price/market/MarketDataSource'
import { useCoinMarketChartQuery } from '@core/ui/chain/coin/price/market/queries/useCoinMarketChartQuery'
import { Query } from '@lib/ui/query/Query'
import { Coin } from '@vultisig/core-chain/coin/Coin'

import { buildLimitPairSeries } from './pairSeries'

type UseLimitPairChartQueryInput = {
  fromCoin: Coin
  toCoin: Coin
  range: MarketChartRange
  /** False while the chart is collapsed, so neither leg is fetched. */
  isEnabled: boolean
}

/**
 * History of the pair ratio for the limit chart, composed from the two legs'
 * own fiat series so both cache entries are shared with the coin-detail chart
 * rather than duplicated under a pair-shaped key.
 *
 * `data` is `null` — not an error — when the pair simply cannot be charted
 * honestly: a leg CoinGecko cannot resolve, or legs that fail one of
 * `buildLimitPairSeries`'s guards. The form treats that as "no chart", never as
 * a reason to hold up an order.
 */
export const useLimitPairChartQuery = ({
  fromCoin,
  toCoin,
  range,
  isEnabled,
}: UseLimitPairChartQueryInput): Query<MarketChartPoint[] | null> => {
  const sellSource = resolveMarketDataSource({
    chain: fromCoin.chain,
    id: fromCoin.id,
    priceProviderId: fromCoin.priceProviderId,
  })
  const buySource = resolveMarketDataSource({
    chain: toCoin.chain,
    id: toCoin.id,
    priceProviderId: toCoin.priceProviderId,
  })

  const sell = useCoinMarketChartQuery({
    source: sellSource,
    range,
    isEnabled,
  })
  const buy = useCoinMarketChartQuery({ source: buySource, range, isEnabled })

  if (!sellSource || !buySource) {
    return { data: null, error: null, isPending: false }
  }

  const error = sell.error ?? buy.error
  if (error) {
    return { data: undefined, error, isPending: false }
  }

  if (sell.data === undefined || buy.data === undefined) {
    return { data: undefined, error: null, isPending: true }
  }

  const isPlaceholderData = sell.isPlaceholderData || buy.isPlaceholderData

  if (!sell.data || !buy.data) {
    return { data: null, error: null, isPending: false, isPlaceholderData }
  }

  return {
    data: buildLimitPairSeries({ sell: sell.data, buy: buy.data }),
    error: null,
    isPending: false,
    isPlaceholderData,
  }
}
