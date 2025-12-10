import { EmptyState } from '@lib/ui/status/EmptyState'
import { useTranslation } from 'react-i18next'

export const PositionsEmptyState = () => {
  const { t } = useTranslation()

  return (
    <EmptyState
      title={t('no_positions_found')}
      description={t('adjust_search_query')}
    />
  )
}
