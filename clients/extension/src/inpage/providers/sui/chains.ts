import type { IdentifierString } from '@wallet-standard/base'

const SuiMainnetChain = 'sui:mainnet'

export const SuiChains = [SuiMainnetChain] as const

export type SuiChain = (typeof SuiChains)[number]

export function isSuiChain(chain: IdentifierString): chain is SuiChain {
  return SuiChains.includes(chain as SuiChain)
}
