import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ManagePillButton } from '@core/ui/vault/components/ManagePillButton'
import { Tabs } from '@lib/ui/base/Tabs'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, IsDisabledProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { getDefiChainTabs } from './config'
import { DefiChainPageTab } from './core'
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

  // Whichever tab leads in `getDefiChainTabs` is the one the screen opens on,
  // so Solana lands on Earn rather than on the second tab — matching the design
  // and `vultisig-android`.
  const defaultTab: DefiChainPageTab = includeBonding
    ? 'bonded'
    : includeEarn
      ? 'earn'
      : 'staked'
  // An entry point that named a tab wins over the tab last left open: it is
  // the only one that knows what the user just asked to see. A tab this chain
  // does not offer falls through to the reset below.
  const [activeTab, setActiveTab] = useState<DefiChainPageTab>(
    requestedTab ?? getLastDefiChainTab(chain) ?? defaultTab
  )
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
          <ManagePillButton
            data-testid="manage-defi-positions-button"
            onClick={() =>
              navigate({
                id: 'manageDefiPositions',
                state: { chain, returnTab: activeTab },
              })
            }
          >
            <IconWrapper size={16}>
              <WalletIcon />
            </IconWrapper>
            <Text variant="footnote" color="contrast">
              {t('position_label')}
            </Text>
          </ManagePillButton>
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
