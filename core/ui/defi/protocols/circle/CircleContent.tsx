import { featureFlags } from '@core/ui/featureFlags'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CircleYieldDetails } from './components/CircleYieldDetails'
import { InfoBanner } from './components/InfoBanner'
import { CircleDepositedPanel } from './deposited/CircleDepositedPanel'
import { useCircleAccountQuery } from './queries/circleAccount'

export const CircleContent = () => {
  const { t } = useTranslation()
  const accountQuery = useCircleAccountQuery()

  return (
    <VStack gap={12}>
      <Text size={14} color="shyExtra">
        {t('circle.introduction')}
      </Text>
      <InfoBanner />
      <CircleDepositedPanel />
      {featureFlags.circleYieldDetails && accountQuery.data && (
        <CircleYieldDetails />
      )}
    </VStack>
  )
}
