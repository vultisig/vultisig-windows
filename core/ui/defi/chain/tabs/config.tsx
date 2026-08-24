import { QbtcGovernanceTab } from '@core/ui/qbtc/governance/components/QbtcGovernanceTab'
import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { featureFlags } from '../../../featureFlags'
import { BondedPositions } from './BondedPositions'
import { DefiChainPageTab } from './core'
import { EarnPositions } from './EarnPositions'
import { LpPositions } from './LpPositions'
import { StakedPositions } from './StakedPositions'

type DefiChainTabsOptions = {
  includeBonded?: boolean
  /**
   * The LPs tab only renders THORChain / MayaChain liquidity positions,
   * so it's only meaningful for those chains. Other chains (Terra,
   * Cosmos, Tron, Circle, …) get the same gating as `bonded`.
   */
  includeLps?: boolean
  /** QBTC-only governance segment (proposal browsing + on-chain voting). */
  includeGovernance?: boolean
  /**
   * Solana-only Earn segment (Kamino Earn vaults). Other chains have no
   * curated earn vaults, so the tab would render empty for them. Where it is
   * present it leads `staked` — see the ordering note on `getDefiChainTabs`.
   */
  includeEarn?: boolean
}

/**
 * Tabs for the DeFi chain page, in render order.
 *
 * `earn` deliberately precedes `staked`: yield is the reason most users open
 * this screen, so the design leads with it, and `vultisig-android` orders its
 * Solana tabs the same way. `bonded` still leads where it is present
 * (THORChain / MayaChain), which have no earn segment.
 */
export const getDefiChainTabs = (
  t: TFunction,
  {
    includeBonded = true,
    includeLps = true,
    includeGovernance = false,
    includeEarn = false,
  }: DefiChainTabsOptions = {}
): Tab<DefiChainPageTab>[] => [
  ...(includeBonded
    ? [
        {
          value: 'bonded' as const,
          label: t('defiChainTabs.bonded'),
          renderContent: BondedPositions,
        },
      ]
    : []),
  ...(includeEarn
    ? [
        {
          value: 'earn' as const,
          label: t('defiChainTabs.earn'),
          renderContent: EarnPositions,
        },
      ]
    : []),
  {
    value: 'staked' as const,
    label: t('defiChainTabs.staked'),
    renderContent: StakedPositions,
  },
  ...(featureFlags.defiLpsTab && includeLps
    ? [
        {
          value: 'lps' as const,
          label: t('defiChainTabs.lps'),
          renderContent: LpPositions,
        },
      ]
    : []),
  ...(includeGovernance
    ? [
        {
          value: 'governance' as const,
          label: t('defiChainTabs.governance'),
          renderContent: QbtcGovernanceTab,
        },
      ]
    : []),
]
