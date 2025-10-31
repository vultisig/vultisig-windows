import { Tab } from '@lib/ui/base/Tabs'

import { Tokens } from './Tokens'

export type VaultChainPageTab = 'tokens'

export const vaultChainTabs: Tab<VaultChainPageTab>[] = [
  {
    value: 'tokens',
    label: 'Tokens',
    renderContent: Tokens,
  },
]
