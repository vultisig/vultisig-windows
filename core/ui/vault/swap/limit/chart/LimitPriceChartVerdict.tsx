import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { Text, TextColor } from '@lib/ui/text'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { useTranslation } from 'react-i18next'

import { getLimitChartReach, LimitChartReach } from './chartReach'
import { formatLimitChartRelativeTime } from './relativeTime'

type LimitPriceChartVerdictProps = {
  points: MarketChartPoint[]
  marketPrice: number
  targetPrice: number
  /** Formats a rate in the pair's own units, for the high-water mark. */
  formatPrice: (rate: number) => string
}

/**
 * One line on whether the charted window says the target is reachable — the
 * question the line itself leaves the user to eyeball. Renders nothing when
 * the series cannot answer it.
 */
export const LimitPriceChartVerdict = ({
  points,
  marketPrice,
  targetPrice,
  formatPrice,
}: LimitPriceChartVerdictProps) => {
  const { t, i18n } = useTranslation()

  const reach = getLimitChartReach({ points, targetPrice, marketPrice })

  if (!reach) {
    return null
  }

  const { message, color } = matchRecordUnion<
    LimitChartReach,
    { message: string; color: TextColor }
  >(reach, {
    atOrBelowMarket: () => ({
      message: t('swap_limit_chart_fills_immediately'),
      color: 'danger',
    }),
    lastTraded: timestamp => ({
      message: t('swap_limit_chart_last_traded', {
        when: formatLimitChartRelativeTime({
          timestamp,
          now: Date.now(),
          locale: i18n.language,
        }),
      }),
      color: 'success',
    }),
    notReached: highest => ({
      message: t('swap_limit_chart_not_reached', {
        price: formatPrice(highest),
      }),
      color: 'shy',
    }),
  })

  return (
    <Text size={12} color={color}>
      {message}
    </Text>
  )
}
