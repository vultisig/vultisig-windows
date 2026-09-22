import { borderRadius } from '@lib/ui/css/borderRadius'
import { Text } from '@lib/ui/text'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getLimitChartReachColor, LimitChartReach } from './chartReach'
import { formatLimitChartRelativeTime } from './relativeTime'

type LimitPriceChartVerdictProps = {
  reach: LimitChartReach
  /** Formats a rate in the pair's own units, for the high-water mark. */
  formatPrice: (rate: number) => string
}

/**
 * One line on whether the charted window says the target is reachable — the
 * question the line itself leaves the user to eyeball. The text stays quiet;
 * the dot in front of it carries the verdict's colour, the same one the rule
 * on the chart is drawn in.
 */
export const LimitPriceChartVerdict = ({
  reach,
  formatPrice,
}: LimitPriceChartVerdictProps) => {
  const { t, i18n } = useTranslation()

  const message = matchRecordUnion<LimitChartReach, string>(reach, {
    belowMarket: () => t('swap_limit_chart_fills_immediately'),
    lastTraded: timestamp =>
      t('swap_limit_chart_last_traded', {
        when: formatLimitChartRelativeTime({
          timestamp,
          now: Date.now(),
          locale: i18n.language,
        }),
      }),
    notReached: highest =>
      t('swap_limit_chart_not_reached', {
        price: formatPrice(highest),
      }),
  })

  return (
    <Text size={12} color="shy">
      <Text as="span" color={getLimitChartReachColor(reach)}>
        <Dot />
      </Text>
      {message}
    </Text>
  )
}

// Painted with its wrapper's text colour, so it cannot drift from the verdict.
const Dot = styled.span`
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 6px;
  vertical-align: middle;
  ${borderRadius.pill};
  background: currentColor;
`
