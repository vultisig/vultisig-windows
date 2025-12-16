import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CircleYieldDetails } from './components/CircleYieldDetails'
import { InfoBanner } from './components/InfoBanner'
import { CircleDepositedPanel } from './deposited/CircleDepositedPanel'
import { useCircleAccountQuery } from './queries/circleAccount'

type CircleContentProps = {
  onDeposit: () => void
  onWithdraw: () => void
}

export const CircleContent = ({
  onDeposit,
  onWithdraw,
}: CircleContentProps) => {
  const { t } = useTranslation()
  const accountQuery = useCircleAccountQuery()

  return (
    <VStack gap={12}>
      <Text size={14} color="shyExtra">
        {t('circle.introduction')}
      </Text>
      <InfoBanner />
      <CircleDepositedPanel onDeposit={onDeposit} onWithdraw={onWithdraw} />
      {accountQuery.data && <CircleYieldDetails onWithdraw={onWithdraw} />}
    </VStack>
  )
}
