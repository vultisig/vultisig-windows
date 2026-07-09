import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Tab, Tabs } from '@lib/ui/base/Tabs'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { hStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ChildrenProp, IsActiveProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { RefreshSwap } from '../components/RefreshSwap'
import { AdvancedSwapSettings } from './advanced/AdvancedSwapSettings'
import { LimitSwapForm } from './LimitSwapForm'
import { MarketSwapForm } from './MarketSwapForm'

type SwapMode = 'market' | 'limit'

export const SwapForm: FC<OnFinishProp<SwapQuote>> = ({ onFinish }) => {
  const { t } = useTranslation()
  const [swapMode, setSwapMode] = useState<SwapMode>('market')
  const showAdvancedSettings = swapMode === 'market'

  const tabs: Tab<SwapMode>[] = [
    {
      value: 'market',
      label: t('swap_mode_market'),
      renderContent: () => <MarketSwapForm onFinish={onFinish} />,
    },
    {
      value: 'limit',
      label: t('swap_mode_limit'),
      renderContent: LimitSwapForm,
    },
  ]

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSwap />}
        title={t('swap')}
        hasBorder
      />
      <Tabs
        tabs={tabs}
        value={swapMode}
        onValueChange={setSwapMode}
        triggersContainer={({ children }) => (
          <SwapModeTabsHeader showAdvancedSettings={showAdvancedSettings}>
            {children}
          </SwapModeTabsHeader>
        )}
        triggerSlot={({ tab: { label }, isActive, ...triggerProps }) => (
          <TriggerItem {...triggerProps} isActive={isActive}>
            <Text
              size={14}
              as="span"
              color={isActive ? 'contrast' : 'supporting'}
            >
              {label}
            </Text>
          </TriggerItem>
        )}
      />
    </>
  )
}

type SwapModeTabsHeaderProps = ChildrenProp & {
  showAdvancedSettings: boolean
}

const SwapModeTabsHeader = ({
  children,
  showAdvancedSettings,
}: SwapModeTabsHeaderProps) => (
  <Header>
    <TabsHeader>{children}</TabsHeader>
    {showAdvancedSettings ? <AdvancedSwapSettings /> : null}
  </Header>
)

const Header = styled.div`
  ${hStack({ justifyContent: 'space-between', alignItems: 'center', gap: 16 })};
  padding: 16px 16px 0;
`

const TabsHeader = styled.div`
  ${hStack({ gap: 24, alignItems: 'center' })};
`

const TriggerItem = styled(UnstyledButton)<IsActiveProp>`
  width: fit-content;
  padding-bottom: 6px;
  cursor: pointer;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1.5px solid ${theme.colors.buttonPrimary.toCssValue()};
    `};
`
