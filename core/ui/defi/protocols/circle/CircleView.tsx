import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { Match } from '@lib/ui/base/Match'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TabsHeader, TriggerItem } from '../../chain/tabs/DefiChainTabs'
import { CircleBanner } from './banner/CircleBanner'
import { CircleContent } from './CircleContent'
import { CircleDepositView } from './deposit/CircleDepositView'
import { CircleWithdrawView } from './withdraw/CircleWithdrawView'

type CircleTab = 'deposited'

type CircleViewState = 'home' | 'deposit' | 'withdraw'

export const CircleView = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<CircleTab>('deposited')
  const [viewState, setViewState] = useState<CircleViewState>('home')

  const tabs: Tab<CircleTab>[] = [
    {
      value: 'deposited',
      label: t('deposited'),
      renderContent: () => (
        <CircleContent
          onDeposit={() => setViewState('deposit')}
          onWithdraw={() => setViewState('withdraw')}
        />
      ),
    },
  ]

  return (
    <Match
      value={viewState}
      home={() => (
        <VStack flexGrow>
          <VaultHeader primaryControls={<PageHeaderBackButton />} />
          <FitPageContent contentMaxWidth={400}>
            <VStack gap={12} flexGrow>
              <CircleBanner />
              <Tabs
                tabs={tabs}
                value={activeTab}
                onValueChange={setActiveTab}
                triggerSlot={({
                  tab: { label, disabled },
                  isActive,
                  ...props
                }) => (
                  <TriggerItem
                    {...props}
                    isActive={isActive}
                    isDisabled={disabled}
                  >
                    {label}
                  </TriggerItem>
                )}
                triggersContainer={({ children }) => (
                  <TabsHeader>{children}</TabsHeader>
                )}
              />
            </VStack>
          </FitPageContent>
        </VStack>
      )}
      deposit={() => <CircleDepositView onBack={() => setViewState('home')} />}
      withdraw={() => (
        <CircleWithdrawView onBack={() => setViewState('home')} />
      )}
    />
  )
}
