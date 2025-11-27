import { featureFlags } from '@core/ui/featureFlags'
import { Tab } from '@lib/ui/base/Tabs'

import { BondedPositions } from './BondedPositions'
import { LpPositions } from './LpPositions'
import { StakedPositions } from './StakedPositions'

export type DefiChainPageTab = 'bonded' | 'staked' | 'lps'

export const defiChainTabs: Tab<DefiChainPageTab>[] = [
  {
    value: 'bonded',
    label: 'Bonded',
    renderContent: BondedPositions,
  },
  {
    value: 'staked',
    label: 'Staked',
    renderContent: StakedPositions,
  },
  ...(featureFlags.defiLpTab
    ? [
        {
          value: 'lps' as const,
          label: 'LPs',
          renderContent: LpPositions,
        },
      ]
    : []),
]
