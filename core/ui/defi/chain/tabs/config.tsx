import { featureFlags } from '@core/ui/featureFlags'
import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { BondedPositions } from './BondedPositions'
import { LpPositions } from './LpPositions'
import { StakedPositions } from './StakedPositions'

export type DefiChainPageTab = 'bonded' | 'staked' | 'lps'

export const getDefiChainTabs = (t: TFunction): Tab<DefiChainPageTab>[] => [
  {
    value: 'bonded',
    label: t('defiChainTabs.bonded'),
    renderContent: BondedPositions,
  },
  ...(featureFlags.defiStakedTab
    ? [
        {
          value: 'staked' as const,
          label: t('defiChainTabs.staked'),
          renderContent: StakedPositions,
        },
      ]
    : []),
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
