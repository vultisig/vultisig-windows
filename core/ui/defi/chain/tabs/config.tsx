import { featureFlags } from '@core/ui/featureFlags'
import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { BondedPositions } from './BondedPositions'
import { LpPositions } from './LpPositions'
import { StakedPositions } from './StakedPositions'
import { ThorchainBondedTab } from './thor/ThorchainBondedTab'
import { ThorchainLpTab } from './thor/ThorchainLpTab'
import { ThorchainStakedTab } from './thor/ThorchainStakedTab'

export type DefiChainPageTab = 'bonded' | 'staked' | 'lps'

const getDefiChainTabs = (t: TFunction): Tab<DefiChainPageTab>[] => [
  {
    value: 'bonded',
    label: t('defiChainTabs.bonded'),
    renderContent: BondedPositions,
  },
  {
    value: 'staked',
    label: t('defiChainTabs.staked'),
    renderContent: StakedPositions,
  },
  ...(featureFlags.defiLpTab
    ? [
        {
          value: 'lps' as const,
          label: t('defiChainTabs.lps'),
          renderContent: LpPositions,
        },
      ]
    : []),
]

// If the active chain is THORChain, use the bespoke tabs that show live data
export const useThorAwareDefiTabs = (t: TFunction) => {
  const chain = useCurrentDefiChain()
  const base = getDefiChainTabs(t)

  if (chain !== 'THORChain') {
    return base
  }

  return base.map(tab => {
    if (tab.value === 'bonded') {
      return { ...tab, renderContent: ThorchainBondedTab }
    }
    if (tab.value === 'staked') {
      return { ...tab, renderContent: ThorchainStakedTab }
    }
    if (tab.value === 'lps') {
      return { ...tab, renderContent: ThorchainLpTab }
    }
    return tab
  })
}
