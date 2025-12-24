import { Chain } from '@core/chain/Chain'

import { DefiChainPageTab } from './config'

const lastTabByChain: Partial<Record<Chain, DefiChainPageTab>> = {}

export const getLastDefiChainTab = (chain: Chain): DefiChainPageTab | null =>
  lastTabByChain[chain] ?? null

export const setLastDefiChainTab = (
  chain: Chain,
  tab: DefiChainPageTab
): void => {
  lastTabByChain[chain] = tab
}
