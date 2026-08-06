import { CoinMarketStats } from '@core/ui/chain/coin/price/market/getCoinMarketStats'
import { resolveMarketDataSource } from '@core/ui/chain/coin/price/market/MarketDataSource'
import { useCoinMarketStatsQuery } from '@core/ui/chain/coin/price/market/queries/useCoinMarketStatsQuery'
import { FiatAmountText } from '@core/ui/chain/components/FiatAmountText'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { CoinDetailSection } from './CoinDetailSection'
import { CoinMarketStatRow } from './CoinMarketStatRow'
import { CoinPriceRangeBand } from './CoinPriceRangeBand'

type CoinPriceExtremesSectionProps = {
  coin: VaultChainCoin
}

/**
 * Price extremes for coins with a CoinGecko id: the 24h low–high band with
 * the current price's position, and all-time high/low rows with their
 * distance from the current price and dates. Appears once stats load —
 * the market stats skeleton covers the loading state.
 */
export const CoinPriceExtremesSection = ({
  coin,
}: CoinPriceExtremesSectionProps) => {
  const { t, i18n } = useTranslation()
  const { priceProviderId } = useCurrentVaultCoin(coin)

  const source = resolveMarketDataSource({
    chain: coin.chain,
    id: coin.id,
    priceProviderId,
  })

  const statsQuery = useCoinMarketStatsQuery(source)

  if (!source || !('id' in source)) return null

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp))

  type FormatExtremeCaptionInput = {
    changePercentage: number | null
    date: number | null
  }

  const formatExtremeCaption = ({
    changePercentage,
    date,
  }: FormatExtremeCaptionInput) => {
    const parts: string[] = []

    if (changePercentage !== null) {
      parts.push(
        t('percentage_value', {
          value: `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(2)}`,
        })
      )
    }
    if (date !== null) {
      parts.push(formatDate(date))
    }

    return parts.length > 0 ? parts.join(' · ') : undefined
  }

  const renderContent = (stats: CoinMarketStats) => {
    const { low24h, high24h, currentPrice } = stats
    const band =
      low24h !== null &&
      high24h !== null &&
      high24h > low24h &&
      currentPrice !== null
        ? { low: low24h, high: high24h, current: currentPrice }
        : null

    const hasContent = band !== null || stats.ath !== null || stats.atl !== null
    if (!hasContent) return null

    return (
      <CoinDetailSection title={t('price_range')}>
        {band ? (
          <CoinPriceRangeBand
            low={band.low}
            high={band.high}
            current={band.current}
          />
        ) : null}
        {stats.ath !== null ? (
          <CoinMarketStatRow
            label={t('all_time_high')}
            value={<FiatAmountText value={stats.ath} />}
            subValue={formatExtremeCaption({
              changePercentage: stats.athChangePercentage,
              date: stats.athDate,
            })}
          />
        ) : null}
        {stats.atl !== null ? (
          <CoinMarketStatRow
            label={t('all_time_low')}
            value={<FiatAmountText value={stats.atl} />}
            subValue={formatExtremeCaption({
              changePercentage: stats.atlChangePercentage,
              date: stats.atlDate,
            })}
          />
        ) : null}
      </CoinDetailSection>
    )
  }

  return <MatchQuery value={statsQuery} success={renderContent} />
}
