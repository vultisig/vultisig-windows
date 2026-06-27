import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { getQbtcVotingRemaining } from '../presentation'

/**
 * Renders "Ends in 1d 4h" / "Ends in 12m" / "Voting ended" for a proposal's
 * voting window. Renders nothing when no end time is known.
 */
export const VotingCountdown = ({
  votingEndTime,
}: {
  votingEndTime: string | undefined
}) => {
  const { t } = useTranslation()
  const remaining = getQbtcVotingRemaining({
    votingEndTime,
    nowMs: Date.now(),
  })

  if (!remaining) return null

  if (remaining.ended) {
    return (
      <Text size={12} color="shy">
        {t('qbtc_gov.voting_ended')}
      </Text>
    )
  }

  const { days, hours, minutes } = remaining
  const duration =
    days > 0
      ? t('qbtc_gov.duration_days_hours', { days, hours })
      : hours > 0
        ? t('qbtc_gov.duration_hours_minutes', { hours, minutes })
        : t('qbtc_gov.duration_minutes', { minutes })

  return (
    <Text size={12} color="shy">
      {t('qbtc_gov.voting_ends_in', { duration })}
    </Text>
  )
}
