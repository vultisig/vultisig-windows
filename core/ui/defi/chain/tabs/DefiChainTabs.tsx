import { Chain } from '@core/chain/Chain'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Tabs } from '@lib/ui/base/Tabs'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiChainPageTab, getDefiChainTabs } from './config'
import { getLastDefiChainTab, setLastDefiChainTab } from './lastTab'

export const DefiChainTabs = () => {
  const { t } = useTranslation()
  const chain = useCurrentDefiChain()
  const includeBonding = chain === Chain.THORChain || chain === Chain.MayaChain

  const defaultTab: DefiChainPageTab = includeBonding ? 'bonded' : 'staked'
  const [activeTab, setActiveTab] = useState<DefiChainPageTab>(
    getLastDefiChainTab(chain) ?? defaultTab
  )
  const { colors } = useTheme()
  const navigate = useCoreNavigate()
  const tabs = useMemo(
    () => getDefiChainTabs(t, { includeBonded: includeBonding }),
    [t, includeBonding]
  )

  useEffect(() => {
    if (!tabs.length) return

    const isActiveTabAvailable = tabs.some(tab => tab.value === activeTab)
    if (!isActiveTabAvailable) {
      setActiveTab(tabs[0].value)
    }
  }, [tabs, activeTab])

  useEffect(() => {
    setLastDefiChainTab(chain, activeTab)
  }, [chain, activeTab])

  if (!tabs.length) {
    return null
  }

  return (
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
        <TabsHeader>
          <HStack gap={12} alignItems="center">
            {children}
          </HStack>
          <IconButton
            kind="secondary"
            onClick={() =>
              navigate({
                id: 'manageDefiPositions',
                state: { chain, returnTab: activeTab },
              })
            }
            style={{
              color: colors.info.toCssValue(),
            }}
            size="lg"
          >
            <CryptoWalletPenIcon />
          </IconButton>
        </TabsHeader>
      )}
    />
  )
}

export const TabsHeader = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  })};

  margin-bottom: 16px;
`

export const TriggerItem = styled(UnstyledButton)<
  IsActiveProp & IsDisabledProp
>`
  width: fit-content;
  padding-bottom: 6px;
  cursor: pointer;
  font-size: 14px;

  ${hStack({
    alignItems: 'center',
    gap: 6,
  })};

  ${({ isActive, theme }) =>
    isActive &&
    css`
      border-bottom: 1.5px solid ${theme.colors.primaryAccentFour.toCssValue()};
      color: ${theme.colors.contrast.toCssValue()};
    `};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      cursor: not-allowed;
    `};
`
