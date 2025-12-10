import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TabsHeader, TriggerItem } from '../../chain/tabs/DefiChainTabs'
import { CircleBanner } from './banner/CircleBanner'
import { CircleContent } from './CircleContent'

type CircleTab = 'deposited'

export const CircleView = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<CircleTab>('deposited')

  const tabs: Tab<CircleTab>[] = [
    {
      value: 'deposited',
      label: t('circle.deposited_tab'),
      renderContent: () => <CircleContent />,
    },
  ]

  return (
    <VStack flexGrow>
      <VaultHeader primaryControls={<PageHeaderBackButton />} />
      <FitPageContent contentMaxWidth={400}>
        <VStack gap={12} flexGrow>
          <CircleBanner />
          <Tabs
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            triggerSlot={({ tab: { label, disabled }, isActive, ...props }) => (
              <TriggerItem {...props} isActive={isActive} isDisabled={disabled}>
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
  )
}
