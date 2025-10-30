import { Tabs } from '@lib/ui/base/Tabs'
import { hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import styled, { css } from 'styled-components'

import { SearchChainTokenProvider } from '../state/searchChainTokenProvider'
import { VaultChainPageTab, vaultChainTabs } from './config'
import { VaultChainTabsHeader } from './VaultChainTabsHeader'

export const VaultChainTabs = () => {
  const [activeTab, setActiveTab] = useState<VaultChainPageTab>('tokens')

  return (
    <SearchChainTokenProvider initialValue="">
      <Tabs
        tabs={vaultChainTabs}
        value={activeTab}
        onValueChange={setActiveTab}
        triggerSlot={({ tab: { label, disabled }, isActive }) => (
          <TriggerItem isActive={isActive} isDisabled={disabled}>
            <Text
              size={14}
              as="span"
              color={isActive ? 'contrast' : 'supporting'}
            >
              {label}
            </Text>
          </TriggerItem>
        )}
        triggersContainer={VaultChainTabsHeader}
      />
    </SearchChainTokenProvider>
  )
}

const TriggerItem = styled.div<IsActiveProp & IsDisabledProp>`
  width: fit-content;
  padding-bottom: 6px;
  cursor: pointer;

  ${hStack({
    alignItems: 'center',
    gap: 6,
  })};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1.5px solid ${theme.colors.buttonPrimary.toCssValue()};
    `};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
    `};
`
