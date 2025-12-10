import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { truncateId } from '@lib/utils/string/truncate'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TabsHeader, TriggerItem } from '../../chain/tabs/DefiChainTabs'
import { CircleBanner } from './banner/CircleBanner'
import { APYOverview } from './components/APYOverview'
import { BalanceOverviewTable } from './components/BalanceOverviewTable'
import { InfoBanner } from './components/InfoBanner'
import { OpenCircleAccount } from './components/OpenCircleAccount'
import { TransactionActions } from './components/TransactionActions'
import { useCircleAccountQuery } from './queries/circleAccount'

type CircleTab = 'deposited'

export const CircleView = () => {
  const { t } = useTranslation()
  const circleAccountQuery = useCircleAccountQuery()
  const [activeTab, setActiveTab] = useState<CircleTab>('deposited')

  const DepositedTabContent = () => (
    <MatchQuery
      value={circleAccountQuery}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
      inactive={() => <OpenCircleAccount />}
      success={circleAccountAddress =>
        circleAccountAddress ? (
          <MainWrapper>
            <p>Circle account: {truncateId(circleAccountAddress)}</p>
            <Text weight={600}>{t('circle.balance_title')}</Text>
            <BalanceOverviewTable />
            <APYOverview />
            <div />
            <Button>{t('circle.claim')}</Button>
            <TransactionActions />
            <InfoBanner />
          </MainWrapper>
        ) : (
          <OpenCircleAccount />
        )
      }
    />
  )

  const tabs: Tab<CircleTab>[] = [
    {
      value: 'deposited',
      label: t('circle.deposited_tab'),
      renderContent: DepositedTabContent,
    },
  ]

  return (
    <VStack flexGrow>
      <VaultHeader primaryControls={<PageHeaderBackButton />} />
      <FitPageContent contentMaxWidth={400}>
        <VStack gap={12} flexGrow>
          <CircleBanner />
          <Text size={14} color="shyExtra">
            {t('circle.introduction')}
          </Text>
          <Tabs
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            triggerSlot={({ tab: { label, disabled }, isActive, ...props }) => (
              <TriggerItem {...props} isActive={isActive} isDisabled={disabled}>
                <Text
                  size={14}
                  as="span"
                  color={isActive ? 'contrast' : 'supporting'}
                >
                  {label}
                </Text>
              </TriggerItem>
            )}
            triggersContainer={({ children }) => (
              <TabsHeader>
                <HStack gap={12} alignItems="center">
                  {children}
                </HStack>
              </TabsHeader>
            )}
          />
        </VStack>
      </FitPageContent>
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
