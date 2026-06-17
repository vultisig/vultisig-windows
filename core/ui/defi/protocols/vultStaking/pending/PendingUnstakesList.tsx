import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { usePendingUnstakesQuery } from '../queries/usePendingUnstakesQuery'
import { PendingUnstakeCard } from './PendingUnstakeCard'

export const PendingUnstakesList = () => {
  const { t } = useTranslation()
  const query = usePendingUnstakesQuery()

  return (
    <MatchQuery
      value={query}
      success={requests =>
        requests.length > 0 ? (
          <VStack gap={8}>
            <Text size={14} weight={500} color="shy">
              {t('vultStaking.pending_unstakes')}
            </Text>
            {requests.map(request => (
              <PendingUnstakeCard
                key={String(request.requestId)}
                request={request}
              />
            ))}
          </VStack>
        ) : null
      }
    />
  )
}
