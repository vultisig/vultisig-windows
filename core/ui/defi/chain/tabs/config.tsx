import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { BondedPositions } from './BondedPositions'
import { StakedPositions } from './StakedPositions'

export type DefiChainPageTab = 'bonded' | 'staked' | 'lps'

type DefiChainTabsOptions = {
  includeBonded?: boolean
}

export const getDefiChainTabs = (
  t: TFunction,
  { includeBonded = true }: DefiChainTabsOptions = {}
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
  // LPs tab is hidden for now
  // {
  //   value: 'lps' as const,
  //   label: t('defiChainTabs.lps'),
  //   renderContent: LpPositions,
  // },
]
