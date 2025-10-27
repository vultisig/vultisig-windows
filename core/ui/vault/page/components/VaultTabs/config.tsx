import { featureFlags } from '@core/ui/featureFlags'
import { Tab } from '@lib/ui/base/Tabs'

import { Portfolio } from './Portfolio'

export type VaultPageTab = 'portfolio' | 'nft'

export const vaultTabs: Tab<VaultPageTab>[] = [
  {
    value: 'portfolio',
    label: 'Portfolio',
    renderContent: () => <Portfolio />,
  },
  {
    value: 'nft',
    label: 'NFT',
    renderContent: () => null,
    disabled: !featureFlags.nftTab,
  },
]
