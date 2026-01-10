import { Tab } from '@lib/ui/base/Tabs'
import { TFunction } from 'i18next'

import { Tokens } from './Tokens'

export type VaultChainPageTab = 'tokens'

export const getVaultChainTabs = (t: TFunction): Tab<VaultChainPageTab>[] => [
  {
    value: 'tokens',
    label: t('tokens_tab'),
    renderContent: Tokens,
  },
]
