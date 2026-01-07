import { Chain } from '@core/chain/Chain'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useSelectedChains, provider: SelectedChainsProvider } =
  getStateProviderSetup<Chain[]>('SelectedChains')
