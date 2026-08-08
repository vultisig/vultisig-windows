import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useTransactionRecordsQuery } from '@core/ui/storage/transactionHistory'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { LimitSwapTransactionRecord } from '../../../../transaction-history/core'
import { useLimitOrderTracking } from '../tracking/useLimitOrderTracking'
import { LimitOrderRecordRow } from './LimitOrderRecordRow'

/**
 * Every limit order this vault has placed, newest first — resting orders with
 * their live fill split and expiry countdown, closed ones with their outcome.
 * Mounts the tracker, so viewing the page is what keeps the records fresh.
 */
export const LimitOrdersPage = () => {
  const { t } = useTranslation()
  const recordsQuery = useTransactionRecordsQuery()
  useLimitOrderTracking()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('swap_limit_orders_title')}
        hasBorder
      />
      <PageContent gap={12} scrollable>
        <MatchQuery
          value={recordsQuery}
          success={records => {
            const orders = records
              .filter(
                (record): record is LimitSwapTransactionRecord =>
                  record.type === 'limitSwap'
              )
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

            if (orders.length === 0) {
              return (
                <Text size={14} color="shy" centerHorizontally>
                  {t('swap_limit_no_orders')}
                </Text>
              )
            }

            return (
              <VStack gap={12}>
                {orders.map(record => (
                  <LimitOrderRecordRow key={record.id} value={record} />
                ))}
              </VStack>
            )
          }}
        />
      </PageContent>
    </VStack>
  )
}
