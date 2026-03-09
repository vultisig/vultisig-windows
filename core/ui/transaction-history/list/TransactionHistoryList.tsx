import { CalendarClockIcon } from '@lib/ui/icons/CalendarClockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { EmptyState } from '@lib/ui/status/EmptyState/EmptyState'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { TransactionRecord } from '../core'
import { groupByDate } from './groupByDate'
import { TransactionRecordCard } from './TransactionRecordCard'

type TransactionHistoryListProps = {
  records: TransactionRecord[]
}

export const TransactionHistoryList = ({
  records,
}: TransactionHistoryListProps) => {
  const { t } = useTranslation()

  if (records.length === 0) {
    return (
      <EmptyState
        icon={
          <IconWrapper size={24} color="buttonHover">
            <CalendarClockIcon />
          </IconWrapper>
        }
        title={t('no_transactions_yet')}
      />
    )
  }

  const groups = groupByDate({
    items: records,
    getTimestamp: record => record.timestamp,
    labels: { today: t('today'), yesterday: t('yesterday') },
  })

  return (
    <VStack gap={20}>
      {groups.map(group => (
        <VStack key={group.label} gap={8}>
          <Text size={13} color="shy" weight={500}>
            {group.label}
          </Text>
          <VStack gap={8}>
            {group.items.map(record => (
              <TransactionRecordCard key={record.id} record={record} />
            ))}
          </VStack>
        </VStack>
      ))}
    </VStack>
  )
}
