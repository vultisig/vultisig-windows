import { MarketChartRange } from '@core/ui/chain/coin/price/market/MarketChartRange'
import { CoinChartRangePicker } from '@core/ui/vault/chain/coin/market/CoinChartRangePicker'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useIsLimitPriceChartExpanded } from '../../../../storage/limitPriceChartExpanded'
import { limitChartHeight } from './config'
import { LimitPriceChart } from './LimitPriceChart'
import { LimitPriceChartVerdict } from './LimitPriceChartVerdict'
import { limitChartRanges } from './range'
import { useLimitPairChartQuery } from './useLimitPairChartQuery'

type LimitPriceChartSectionProps = {
  fromCoin: Coin
  toCoin: Coin
  /** Undefined until the pair's reference quote resolves. */
  marketPrice: number | undefined
  targetPrice: number | null
  /** Formats a rate in the pair's own units, for the chart's labels. */
  formatPrice: (rate: number) => string
  onTargetChange: (rate: number) => void
}

/**
 * The price card's chart disclosure: a collapsed row that, once opened, draws
 * the pair's history against the target and says whether the pair has actually
 * traded there.
 *
 * Collapsed costs nothing — neither leg is fetched until it is opened — and the
 * choice is remembered. Whenever the series cannot be built honestly the
 * section says so and stops; it never blocks or alters the numeric form, which
 * remains the way an order is priced.
 */
export const LimitPriceChartSection = ({
  fromCoin,
  toCoin,
  marketPrice,
  targetPrice,
  formatPrice,
  onTargetChange,
}: LimitPriceChartSectionProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useIsLimitPriceChartExpanded()
  const [range, setRange] = useState<MarketChartRange>(limitChartRanges[0])

  const query = useLimitPairChartQuery({
    fromCoin,
    toCoin,
    range,
    isEnabled: isExpanded && marketPrice !== undefined,
  })

  const unavailable = (
    <Text size={12} color="shy">
      {t('swap_limit_chart_unavailable')}
    </Text>
  )

  return (
    <VStack gap={12}>
      <DisclosureRow
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_chart_title')}
        </Text>
        <Chevron style={{ rotate: isExpanded ? '180deg' : undefined }}>
          <ChevronDownIcon />
        </Chevron>
      </DisclosureRow>

      {isExpanded ? (
        <VStack gap={12}>
          <MatchQuery
            value={query}
            pending={() => (
              <Skeleton
                height={`${limitChartHeight}px`}
                borderRadius={`${borderRadiusPx.md}px`}
              />
            )}
            error={() => unavailable}
            success={points =>
              points && marketPrice !== undefined ? (
                // Dimmed while a range switch is in flight: the legs resolve
                // independently, so for a moment the ratio is drawn over
                // whichever window arrived first.
                <VStack
                  gap={8}
                  style={{ opacity: query.isPlaceholderData ? 0.3 : 1 }}
                >
                  <LimitPriceChart
                    points={points}
                    marketPrice={marketPrice}
                    targetPrice={targetPrice}
                    formatPrice={formatPrice}
                    onTargetChange={onTargetChange}
                  />
                  {targetPrice !== null ? (
                    <LimitPriceChartVerdict
                      points={points}
                      marketPrice={marketPrice}
                      targetPrice={targetPrice}
                      formatPrice={formatPrice}
                    />
                  ) : null}
                </VStack>
              ) : (
                unavailable
              )
            }
          />
          <CoinChartRangePicker
            value={range}
            onChange={setRange}
            ranges={limitChartRanges}
          />
        </VStack>
      ) : null}
    </VStack>
  )
}

const DisclosureRow = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  ${borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  cursor: pointer;
`

const Chevron = styled.div`
  display: flex;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textShy.toCssValue()};
  transition: rotate 0.2s ease-in-out;
`
