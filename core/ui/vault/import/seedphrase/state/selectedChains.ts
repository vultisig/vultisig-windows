import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { Chain } from '@vultisig/core-chain/Chain'

export const [SelectedChainsProvider, useSelectedChains] =
  setupStateProvider<Chain[]>('SelectedChains')
