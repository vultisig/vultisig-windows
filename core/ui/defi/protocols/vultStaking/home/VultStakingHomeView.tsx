import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { DefiBalanceBanner } from '@core/ui/defi/shared/DefiBalanceBanner'
import { DefiPageContainer } from '@core/ui/defi/shared/DefiPageContainer'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultHeader } from '@core/ui/vault/components/VaultHeader'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TabsHeader, TriggerItem } from '../../../chain/tabs/DefiChainTabs'
import { vultStakingName } from '../core/config'
import { VultStakingPanel } from '../deposited/VultStakingPanel'
import { PendingUnstakesList } from '../pending/PendingUnstakesList'
import { useStakedVultFiatBalanceQuery } from '../queries/useStakedVultFiatBalanceQuery'
import { VultStakingBannerLogo } from '../VultStakingBannerLogo'

type VultStakingTab = 'deposited'

export const VultStakingHomeView = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<VultStakingTab>('deposited')
  const fiatBalanceQuery = useStakedVultFiatBalanceQuery()

  const tabs: Tab<VultStakingTab>[] = [
    {
      value: 'deposited',
      label: t('deposited'),
      renderContent: () => (
        <VStack gap={12}>
          <Description size={14} color="shy">
            {t('vultStaking.description')}
          </Description>
          <VultStakingPanel />
          <PendingUnstakesList />
        </VStack>
      ),
    },
  ]

  return (
    <>
      <VaultHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshDefiData />}
      />
      <DefiPageContainer>
        <VStack gap={12} flexGrow>
          <DefiBalanceBanner
            title={vultStakingName}
            logo={<VultStakingBannerLogo />}
            fiatQuery={fiatBalanceQuery}
          />
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
      </DefiPageContainer>
    </>
  )
}

const Description = styled(Text)`
  line-height: 20px;
`
