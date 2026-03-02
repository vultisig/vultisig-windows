import { Chain } from '@core/chain/Chain'

const chainDisplayNames: Partial<Record<Chain, string>> = {
  [Chain.ZcashShielded]: 'ZCash Shielded',
}

export const getChainDisplayName = (chain: Chain): string =>
  chainDisplayNames[chain] ?? chain
