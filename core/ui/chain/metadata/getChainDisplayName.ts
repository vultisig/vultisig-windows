import { Chain } from '@core/chain/Chain'

const chainDisplayNames: Partial<Record<Chain, string>> = {
  [Chain.ZcashSapling]: 'ZCash Sapling',
}

export const getChainDisplayName = (chain: Chain): string =>
  chainDisplayNames[chain] ?? chain
