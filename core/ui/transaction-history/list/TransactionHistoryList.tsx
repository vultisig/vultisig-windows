import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { EmptyState } from '@lib/ui/status/EmptyState/EmptyState'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TransactionRecord, TransactionRecordStatus } from '../core'
import { PendingTransactionProgressCard } from '../progress/PendingTransactionProgressCard'
import { groupByDate } from './groupByDate'
import { TransactionRecordCard } from './TransactionRecordCard'

const pendingStatuses: TransactionRecordStatus[] = ['broadcasted', 'pending']

type TransactionHistoryListProps = {
  records: TransactionRecord[]
}

export const TransactionHistoryList = ({
  records,
}: TransactionHistoryListProps) => {
  const { t, i18n } = useTranslation()

  if (records.length === 0) {
    return (
      <EmptyStateTabPanel>
        <EmptyState
          icon={
            <IconWrapper size={24} color="buttonHover">
              <CalendarIcon />
            </IconWrapper>
          }
          title={t('no_transactions_yet')}
        />
      </EmptyStateTabPanel>
    )
  }

  const groups = groupByDate({
    items: records,
    getTimestamp: record => record.timestamp,
    labels: {
      today: t('today'),
      yesterday: t('yesterday'),
      locale: i18n.language,
    },
  })

  return (
    <VStack gap={20}>
      {groups.map(group => (
        <VStack key={group.label} gap={8}>
          <Text size={13} color="shy" weight={500}>
            {group.label}
          </Text>
          <VStack gap={8}>
            {group.items.map(record =>
              // In-flight records keep their expanded treatment, but stay in
              // the date stream rather than being pinned above it: a limit
              // order rests for up to three days, so "pending" says nothing
              // about how recent it is.
              pendingStatuses.includes(record.status) ? (
                <PendingTransactionProgressCard
                  key={record.id}
                  record={record}
                />
              ) : (
                <TransactionRecordCard key={record.id} record={record} />
              )
            )}
          </VStack>
        </VStack>
      ))}
    </VStack>
  )
}

const EmptyStateTabPanel = styled.div`
  margin-top: 27px;
`
