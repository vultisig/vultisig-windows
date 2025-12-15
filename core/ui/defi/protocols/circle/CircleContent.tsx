import { Button } from '@lib/ui/buttons/Button'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { APYOverview } from './components/APYOverview'
import { BalanceOverviewTable } from './components/BalanceOverviewTable'
import { InfoBanner } from './components/InfoBanner'
import { TransactionActions } from './components/TransactionActions'
import { CircleDepositedPanel } from './deposited/CircleDepositedPanel'
import { useCircleAccountQuery } from './queries/circleAccount'

export const CircleContent = () => {
  const { t } = useTranslation()
  const { data } = useCircleAccountQuery()

  return (
    <VStack gap={12}>
      <Text size={14} color="shyExtra">
        {t('circle.introduction')}
      </Text>
      <InfoBanner />
      {data && (
        <MainWrapper>
          <Text weight={600}>{t('circle.balance_title')}</Text>
          <BalanceOverviewTable />
          <APYOverview />
          <div />
          <Button>{t('circle.claim')}</Button>
          <TransactionActions />
        </MainWrapper>
      )}
      <CircleDepositedPanel />
    </VStack>
  )
}

const MainWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};

  ${vStack({
    gap: 15,
  })};
`
