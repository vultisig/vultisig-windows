import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Tabs } from '@lib/ui/base/Tabs'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HousePenIcon } from '@lib/ui/icons/HousePenIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { defaultDefiChainTab, getDefiChainTabs } from './config'
import { getLastDefiChainTab, setLastDefiChainTab } from './lastTab'

/**
 * The DeFi chain detail page's segmented content, with the segments this chain
 * has anything to show under.
 *
 * Opens the tab the navigation state asked for, falling back to the tab last
 * left open for this chain and then to the chain's default. A tab this chain
 * does not offer - a stale one from persisted navigation state, or one meant
 * for another chain - resets to the first it does.
 */
export const DefiChainTabs = () => {
  const { t } = useTranslation()
  const chain = useCurrentDefiChain()
  const [{ tab: requestedTab }] = useCoreViewState<'defiChainDetail'>()
  const includeBonding = chain === Chain.THORChain || chain === Chain.MayaChain
  // LP positions are only modeled for THORChain / MayaChain — the LpPositions
  // tab queries their LP services and would render empty for other chains.
  const includeLps = chain === Chain.THORChain || chain === Chain.MayaChain
  // QBTC is the only chain exposing the in-app governance segment.
  const includeGovernance = chain === Chain.QBTC
  // Solana is the only chain with curated earn vaults (Kamino Earn).
  const includeEarn = chain === Chain.Solana

  const defaultTab = defaultDefiChainTab({
    includeEarn,
    includeBonded: includeBonding,
  })
  // An entry point that named a tab wins over the tab last left open: it is
  // the only one that knows what the user just asked to see. A tab this chain
  // does not offer falls through to the reset below.
  const [activeTab, setActiveTab] = useState(
    requestedTab ?? getLastDefiChainTab(chain) ?? defaultTab
  )
  const { colors } = useTheme()
  const navigate = useCoreNavigate()
  const tabs = useMemo(
    () =>
      getDefiChainTabs(t, {
        includeBonded: includeBonding,
        includeLps,
        includeGovernance,
        includeEarn,
      }),
    [t, includeBonding, includeLps, includeGovernance, includeEarn]
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
            <HousePenIcon />
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
