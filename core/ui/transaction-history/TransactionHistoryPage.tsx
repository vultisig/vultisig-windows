import { useTransactionRecordsQuery } from '@core/ui/storage/transactionHistory'
import { SearchInput } from '@core/ui/vault/chain/manage/shared/SearchInput'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { IsActiveProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { TransactionRecord } from './core'
import { TransactionHistoryList } from './list/TransactionHistoryList'
import { useRefreshPendingTransactions } from './status/useRefreshPendingTransactions'
import { filterTransactionsBySearch } from './utils/filterTransactionsBySearch'

const transactionHistoryTabs = ['overview', 'swaps', 'sends'] as const
type TransactionHistoryTab = (typeof transactionHistoryTabs)[number]

const tabFilter: Record<
  TransactionHistoryTab,
  ((record: TransactionRecord) => boolean) | undefined
> = {
  overview: undefined,
  swaps: record => record.type === 'swap',
  sends: record => record.type === 'send',
}

const FilteredTransactionList = ({
  records,
  tab,
}: {
  records: TransactionRecord[]
  tab: TransactionHistoryTab
}) => {
  const filterFn = tabFilter[tab]
  const filtered = filterFn ? records.filter(filterFn) : records
  return <TransactionHistoryList records={filtered} />
}

const TransactionHistoryContent = ({
  records,
}: {
  records: TransactionRecord[]
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TransactionHistoryTab>('overview')
  const [search, setSearch] = useState('')

  useRefreshPendingTransactions(records)

  const searchFiltered = filterTransactionsBySearch({
    records,
    query: search,
  })

  const tabs: Tab<TransactionHistoryTab>[] = transactionHistoryTabs.map(
    value => ({
      value,
      label: t(value),
      renderContent: () => (
        <FilteredTransactionList records={searchFiltered} tab={value} />
      ),
    })
  )

  return (
    <VStack gap={16}>
      <SearchInput value={search} onChange={setSearch} />
      <Tabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        triggerSlot={({ tab: { label }, isActive }) => (
          <TabTrigger isActive={isActive}>
            <Text
              size={14}
              as="span"
              color={isActive ? 'contrast' : 'supporting'}
            >
              {label}
            </Text>
          </TabTrigger>
        )}
      />
    </VStack>
  )
}

export const TransactionHistoryPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()
  const query = useTransactionRecordsQuery()

  return (
    <ScreenLayout title={t('transaction_history')} onBack={goBack}>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        error={() => (
          <Text color="danger">{t('failed_to_load_transactions')}</Text>
        )}
        success={records => <TransactionHistoryContent records={records} />}
      />
    </ScreenLayout>
  )
}

const TabTrigger = styled.div<IsActiveProp>`
  width: fit-content;
  padding-bottom: 6px;
  cursor: pointer;

  ${hStack({
    alignItems: 'center',
    gap: 6,
  })};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1.5px solid ${theme.colors.buttonPrimary.toCssValue()};
    `};
`
