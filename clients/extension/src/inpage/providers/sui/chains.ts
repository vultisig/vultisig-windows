import type { IdentifierString } from '@wallet-standard/base'

const SuiMainnetChain = 'sui:mainnet'

export const SuiChains = [SuiMainnetChain] as const

export type SuiChain = (typeof SuiChains)[number]

export const isSuiChain = (chain: IdentifierString): chain is SuiChain =>
  SuiChains.includes(chain as SuiChain)
