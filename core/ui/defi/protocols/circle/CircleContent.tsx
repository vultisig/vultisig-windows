import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { InfoBanner } from './components/InfoBanner'
import { CircleDepositedPanel } from './deposited/CircleDepositedPanel'

export const CircleContent = () => {
  const { t } = useTranslation()

  return (
    <VStack gap={12}>
      <Text size={14} color="shyExtra">
        {t('circle.introduction')}
      </Text>
      <InfoBanner />
      <CircleDepositedPanel />
    </VStack>
  )
}
