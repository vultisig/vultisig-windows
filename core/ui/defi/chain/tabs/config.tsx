import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { featureFlags } from '../../../featureFlags'
import { BondedPositions } from './BondedPositions'
import { LpPositions } from './LpPositions'
import { StakedPositions } from './StakedPositions'

export type DefiChainPageTab = 'bonded' | 'staked' | 'lps'

type DefiChainTabsOptions = {
  includeBonded?: boolean
  /**
   * The LPs tab only renders THORChain / MayaChain liquidity positions,
   * so it's only meaningful for those chains. Other chains (Terra,
   * Cosmos, Tron, Circle, …) get the same gating as `bonded`.
   */
  includeLps?: boolean
}

export const getDefiChainTabs = (
  t: TFunction,
  { includeBonded = true, includeLps = true }: DefiChainTabsOptions = {}
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
]
