import { EvmChain, OtherChain, UtxoChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'

export const blockaidValidationSupportedChains = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
  OtherChain.Sui,
  UtxoChain.Bitcoin,
] as const

export type BlockaidValidationSupportedChain =
  (typeof blockaidValidationSupportedChains)[number]
export type BlockaidValidationSupportedChainKind =
  DeriveChainKind<BlockaidValidationSupportedChain>
