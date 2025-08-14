import { EvmChain, OtherChain, UtxoChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'

export const blockaidSupportedChains = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
  OtherChain.Sui,
  UtxoChain.Bitcoin,
] as const

export type BlockaidSupportedChain = (typeof blockaidSupportedChains)[number]
export type BlockaidSupportedChainKind = DeriveChainKind<BlockaidSupportedChain>
