import { marketChartRanges } from '@core/ui/chain/coin/price/market/MarketChartRange'

/**
 * History windows offered on the limit chart: the coin-detail ranges without
 * 1D. A day of movement is a sliver of the drag zone the plot is anchored to,
 * so it draws as a flat ribbon and tells the user nothing about reachability.
 */
export const limitChartRanges = marketChartRanges.filter(
  range => range !== 'day'
)
