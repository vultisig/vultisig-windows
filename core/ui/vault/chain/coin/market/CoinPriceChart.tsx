import { getMarketChartChangeFraction } from '@core/ui/chain/coin/price/market/marketChart'
import { MarketChartRange } from '@core/ui/chain/coin/price/market/MarketChartRange'
import { resolveMarketDataSource } from '@core/ui/chain/coin/price/market/MarketDataSource'
import { useCoinMarketChartQuery } from '@core/ui/chain/coin/price/market/queries/useCoinMarketChartQuery'
import { useCoinMarketStatsQuery } from '@core/ui/chain/coin/price/market/queries/useCoinMarketStatsQuery'
import { FiatAmountText } from '@core/ui/chain/components/FiatAmountText'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { CoinChartRangePicker } from './CoinChartRangePicker'
import { CoinPriceChartGraph } from './CoinPriceChartGraph'
import { CoinPriceChartPlaceholder } from './CoinPriceChartPlaceholder'
import { formatMarketChartScrubDate } from './formatMarketChartScrubDate'

type CoinPriceChartProps = {
  coin: VaultChainCoin
}

/**
 * The coin-detail price chart card: current/scrubbed price, range change
 * chip, animated series with hover/drag scrubbing, and the range picker.
 * Renders nothing for coins CoinGecko can't chart (pool-priced tokens) and
 * for series too sparse to draw — those coins keep their price row in the
 * token info section instead.
 */
export const CoinPriceChart = ({ coin }: CoinPriceChartProps) => {
  const { t, i18n } = useTranslation()
  const { colors } = useTheme()
  const { priceProviderId } = useCurrentVaultCoin(coin)

  const source = resolveMarketDataSource({
    chain: coin.chain,
    id: coin.id,
    priceProviderId,
  })

  const [range, setRange] = useState<MarketChartRange>('day')
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)

  const chartQuery = useCoinMarketChartQuery({ source, range })
  const statsQuery = useCoinMarketStatsQuery(source)

  if (!source) return null

  const points = chartQuery.data

  const isLoadingFirstSeries = points === undefined && chartQuery.isPending

  // Sparse series or a failed load: leave the layout entirely rather than
  // showing an empty card. The token info section picks up the price row.
  if (!isLoadingFirstSeries && !points) return null

  const chartChangeFraction = points
    ? getMarketChartChangeFraction(points)
    : null
  const stats24hChange = statsQuery.data?.priceChangePercentage24h
  const changeFraction =
    chartChangeFraction ??
    (stats24hChange != null ? stats24hChange / 100 : null)

  const isPositive = (changeFraction ?? 0) >= 0
  const tint = isPositive ? colors.primary : colors.danger

  const scrubbedPoint =
    points && scrubIndex !== null ? points[scrubIndex] : null

  const lastPoint = points ? points[points.length - 1] : null
  const displayedPrice =
    scrubbedPoint?.price ?? coin.price ?? lastPoint?.price ?? null

  const isDimmed = Boolean(chartQuery.isPlaceholderData)

  const handleRangeChange = (value: MarketChartRange) => {
    setScrubIndex(null)
    setRange(value)
  }

  return (
    <Card gap={12}>
      <HStack
        justifyContent="space-between"
        alignItems="flex-start"
        fullWidth
        gap={8}
      >
        <VStack gap={2}>
          <Text size={22} weight={600} color="contrast">
            {displayedPrice !== null ? (
              <FiatAmountText value={displayedPrice} />
            ) : null}
          </Text>
          <ScrubDateCaption>
            <Text size={12} weight={500} color="shy">
              {scrubbedPoint
                ? formatMarketChartScrubDate({
                    timestamp: scrubbedPoint.timestamp,
                    range,
                    locale: i18n.language,
                  })
                : ''}
            </Text>
          </ScrubDateCaption>
        </VStack>
        {changeFraction !== null ? (
          <ChangeChip
            style={{
              background: tint.withAlpha(0.12).toCssValue(),
              opacity: isDimmed ? 0.3 : 1,
            }}
          >
            <Text
              size={12}
              weight={600}
              color={isPositive ? 'success' : 'danger'}
            >
              {t('percentage_value', {
                value: new Intl.NumberFormat(i18n.language, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  signDisplay: 'exceptZero',
                }).format(changeFraction * 100),
              })}
            </Text>
          </ChangeChip>
        ) : null}
      </HStack>
      <GraphContainer style={{ opacity: isDimmed ? 0.3 : 1 }}>
        {points ? (
          <CoinPriceChartGraph
            points={points}
            color={tint.toCssValue()}
            scrubIndex={scrubIndex}
            onScrubChange={setScrubIndex}
          />
        ) : (
          <CoinPriceChartPlaceholder />
        )}
      </GraphContainer>
      <CoinChartRangePicker value={range} onChange={handleRangeChange} />
    </Card>
  )
}

const Card = styled(VStack)`
  width: 100%;
  border-radius: 12px;
  background: ${getColor('background')};
  padding: 16px;
`

const ScrubDateCaption = styled.div`
  height: 16px;
`

const ChangeChip = styled.div`
  padding: 4px 10px;
  border-radius: 999px;
`

const GraphContainer = styled.div`
  width: 100%;
  transition: opacity 0.2s ease-in-out;
`
