import { Tabs } from '@lib/ui/base/Tabs'
import { hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { SearchChainProvider } from '../../state/searchChainProvider'
import { VaultPageTab, vaultTabs } from './config'
import { VaultTabsHeader } from './VaultTabsHeader'

export const VaultTabs = () => {
  const [activeTab, setActiveTab] = useState<VaultPageTab>('portfolio')
  const { t } = useTranslation()

  return (
    <SearchChainProvider initialValue="">
      <Tabs
        tabs={vaultTabs}
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
            {disabled && (
              <ComingSoonWrapper>
                <Text size={10} as="span" color="info">
                  {t('soon')}
                </Text>
              </ComingSoonWrapper>
            )}
          </TriggerItem>
        )}
        triggersContainer={VaultTabsHeader}
      />
    </SearchChainProvider>
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

const ComingSoonWrapper = styled.div`
  padding: 4px 6px;

  ${hStack({
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  })};

  border-radius: 8px;
  background: rgba(81, 128, 252, 0.12);
`
