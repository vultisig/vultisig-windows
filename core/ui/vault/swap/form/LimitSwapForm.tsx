import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useAdvancedSwapQueueEnabledQuery } from '../limit/queries/useAdvancedSwapQueueEnabledQuery'

export const LimitSwapForm = () => {
  const { t } = useTranslation()
  const { data: isQueueEnabled } = useAdvancedSwapQueueEnabledQuery()

  return (
    <PageContent alignItems="center" justifyContent="center" flexGrow>
      <VStack gap={8} alignItems="center">
        <Text size={16} weight={500} color="contrast">
          {t('swap_limit_orders')}
        </Text>
        <Text size={14} color="supporting">
          {isQueueEnabled === false
            ? t('swap_limit_unavailable')
            : t('coming_soon')}
        </Text>
      </VStack>
    </PageContent>
  )
}
