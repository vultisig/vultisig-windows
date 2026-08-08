import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getQbtcVotingRemaining } from '../presentation'

/**
 * Renders "Ends in 1d 4h" / "Ends in 12m" / "Voting ended" for a proposal's
 * voting window, re-evaluating every minute so the remaining time stays
 * current. Renders nothing when no end time is known.
 */
export const VotingCountdown = ({
  votingEndTime,
}: {
  votingEndTime: string | undefined
}) => {
  const { t } = useTranslation()
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const remaining = getQbtcVotingRemaining({ votingEndTime, nowMs })

  if (!remaining) return null

  if (remaining.ended) {
    return (
      <Text size={12} color="shy">
        {t('qbtc_gov.voting_ended')}
      </Text>
    )
  }

  const { days, hours, minutes } = remaining
  const label =
    days > 0
      ? t('qbtc_gov.ends_in_days_hours', { days, hours })
      : hours > 0
        ? t('qbtc_gov.ends_in_hours_minutes', { hours, minutes })
        : t('qbtc_gov.ends_in_minutes', { minutes })

  return (
    <Text size={12} color="shy">
      {label}
    </Text>
  )
}
