import { EvmChain, OtherChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'

export const blockaidSupportedChains = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
] as const

export type BlockaidSupportedChain = (typeof blockaidSupportedChains)[number]
export type BlockaidSupportedChainKind = DeriveChainKind<BlockaidSupportedChain>
