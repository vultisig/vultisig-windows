import { featureFlags } from '@core/ui/featureFlags'
import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { Portfolio } from './Portfolio'

export type VaultPageTab = 'portfolio' | 'nft'

export const getVaultTabs = (t: TFunction): Tab<VaultPageTab>[] => [
  {
    value: 'portfolio',
    label: t('vaultTabs.portfolio'),
    renderContent: () => <Portfolio />,
  },
  ...(featureFlags.nftTab
    ? [
        {
          value: 'nft' as const,
          label: t('vaultTabs.nft'),
          renderContent: () => null,
        },
      ]
    : []),
]
