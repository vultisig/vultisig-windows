import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VotingCountdown } from './VotingCountdown'

const formatDateTime = (iso: string | undefined): string | undefined => {
  if (!iso) return undefined
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

type VotingWindowSectionProps = {
  votingStartTime: string | undefined
  votingEndTime: string | undefined
  isActive: boolean
}

/** Voting start/end dates for a proposal, with a live countdown while active. */
export const VotingWindowSection = ({
  votingStartTime,
  votingEndTime,
  isActive,
}: VotingWindowSectionProps) => {
  const { t } = useTranslation()
  const start = formatDateTime(votingStartTime)
  const end = formatDateTime(votingEndTime)

  if (!start && !end) return null

  return (
    <Card>
      <HStack justifyContent="space-between" alignItems="center">
        <Text size={14} weight="500">
          {t('qbtc_gov.voting_window')}
        </Text>
        {isActive ? <VotingCountdown votingEndTime={votingEndTime} /> : null}
      </HStack>
      {start ? (
        <WindowRow label={t('qbtc_gov.voting_start')} value={start} />
      ) : null}
      {end ? <WindowRow label={t('qbtc_gov.voting_end')} value={end} /> : null}
    </Card>
  )
}

const WindowRow = ({ label, value }: { label: string; value: string }) => (
  <HStack justifyContent="space-between" alignItems="center" gap={12}>
    <Text size={13} color="shy">
      {label}
    </Text>
    <Text size={13}>{value}</Text>
  </HStack>
)

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`
