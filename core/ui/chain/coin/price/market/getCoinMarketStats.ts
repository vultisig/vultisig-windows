import { rootApiUrl } from '@vultisig/core-config'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { addQueryParams } from '@vultisig/lib-utils/query/addQueryParams'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

const baseUrl = `${rootApiUrl}/coingeicko/api/v3/coins/markets`

/**
 * Market statistics for a coin from CoinGecko's `/coins/markets` endpoint,
 * in the requested fiat currency. Every numeric field is nullable — the
 * upstream data is sparse for long-tail tokens — and display code omits
 * rows whose value is missing. Dates are ms-epoch timestamps.
 */
export type CoinMarketStats = {
  currentPrice: number | null
  marketCap: number | null
  marketCapRank: number | null
  fullyDilutedValuation: number | null
  totalVolume: number | null
  high24h: number | null
  low24h: number | null
  priceChangePercentage24h: number | null
  circulatingSupply: number | null
  maxSupply: number | null
  ath: number | null
  athChangePercentage: number | null
  athDate: number | null
  atl: number | null
  atlChangePercentage: number | null
  atlDate: number | null
}

type CoinMarketsResponseItem = {
  id: string
  current_price?: number | null
  market_cap?: number | null
  market_cap_rank?: number | null
  fully_diluted_valuation?: number | null
  total_volume?: number | null
  high_24h?: number | null
  low_24h?: number | null
  price_change_percentage_24h?: number | null
  circulating_supply?: number | null
  max_supply?: number | null
  ath?: number | null
  ath_change_percentage?: number | null
  ath_date?: string | null
  atl?: number | null
  atl_change_percentage?: number | null
  atl_date?: string | null
}

const toFiniteOrNull = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const parseTimestamp = (value: string | null | undefined): number | null => {
  if (!value) return null

  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : null
}

type GetCoinMarketStatsInput = {
  id: string
  fiatCurrency: FiatCurrency
}

/**
 * Fetches market stats for a CoinGecko coin id. Only id-based lookups are
 * supported — `/coins/markets` has no contract variant, so contract-routed
 * tokens render a chart without stats. Throws on an empty response so the
 * query cache doesn't store the miss as success.
 */
export const getCoinMarketStats = async ({
  id,
  fiatCurrency,
}: GetCoinMarketStatsInput): Promise<CoinMarketStats> => {
  const url = addQueryParams(baseUrl, {
    vs_currency: fiatCurrency,
    ids: id.toLowerCase(),
    price_change_percentage: '1h,24h,7d,30d',
  })

  const [record] = await queryUrl<CoinMarketsResponseItem[]>(url)

  if (!record) {
    throw new Error(`No market stats for ${id}`)
  }

  return {
    currentPrice: toFiniteOrNull(record.current_price),
    marketCap: toFiniteOrNull(record.market_cap),
    marketCapRank: toFiniteOrNull(record.market_cap_rank),
    fullyDilutedValuation: toFiniteOrNull(record.fully_diluted_valuation),
    totalVolume: toFiniteOrNull(record.total_volume),
    high24h: toFiniteOrNull(record.high_24h),
    low24h: toFiniteOrNull(record.low_24h),
    priceChangePercentage24h: toFiniteOrNull(
      record.price_change_percentage_24h
    ),
    circulatingSupply: toFiniteOrNull(record.circulating_supply),
    maxSupply: toFiniteOrNull(record.max_supply),
    ath: toFiniteOrNull(record.ath),
    athChangePercentage: toFiniteOrNull(record.ath_change_percentage),
    athDate: parseTimestamp(record.ath_date),
    atl: toFiniteOrNull(record.atl),
    atlChangePercentage: toFiniteOrNull(record.atl_change_percentage),
    atlDate: parseTimestamp(record.atl_date),
  }
}
