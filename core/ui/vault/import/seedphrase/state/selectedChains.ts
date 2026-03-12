import { Chain } from '@core/chain/Chain'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [SelectedChainsProvider, useSelectedChains] =
  setupStateProvider<Chain[]>('SelectedChains')
