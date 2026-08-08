import {
  MarketChartRange,
  marketChartRanges,
} from '@core/ui/chain/coin/price/market/MarketChartRange'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

type CoinChartRangePickerProps = {
  value: MarketChartRange
  onChange: (value: MarketChartRange) => void
}

/**
 * Equal-width 1D / 1W / 1M / 1Y / ALL segments for the coin-detail price
 * chart. Selecting the already-active range is a no-op upstream (the query
 * key doesn't change).
 */
export const CoinChartRangePicker = ({
  value,
  onChange,
}: CoinChartRangePickerProps) => {
  const { t } = useTranslation()

  const labels: Record<MarketChartRange, string> = {
    day: t('chart_range_day'),
    week: t('chart_range_week'),
    month: t('chart_range_month'),
    year: t('chart_range_year'),
    all: t('chart_range_all'),
  }

  return (
    <HStack fullWidth gap={4}>
      {marketChartRanges.map(range => (
        <Segment
          key={range}
          type="button"
          aria-pressed={range === value}
          isActive={range === value}
          onClick={() => onChange(range)}
        >
          <Text
            size={13}
            weight={500}
            color={range === value ? 'contrast' : 'shy'}
          >
            {labels[range]}
          </Text>
        </Segment>
      ))}
    </HStack>
  )
}

const Segment = styled(UnstyledButton)<IsActiveProp>`
  flex: 1;
  padding: 10px 0;
  border-radius: 999px;
  text-align: center;
  cursor: pointer;

  ${({ isActive }) =>
    isActive &&
    css`
      background: ${getColor('foregroundExtra')};
    `};
`
