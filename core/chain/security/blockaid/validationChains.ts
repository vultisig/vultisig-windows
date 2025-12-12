import { OtherChain, UtxoChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'
import { blockaidSupportedEvmChains } from './evmChains'

export const blockaidValidationSupportedChains = [
  ...blockaidSupportedEvmChains,
  OtherChain.Solana,
  OtherChain.Sui,
  UtxoChain.Bitcoin,
] as const

export type BlockaidValidationSupportedChain =
  (typeof blockaidValidationSupportedChains)[number]
export type BlockaidValidationSupportedChainKind =
  DeriveChainKind<BlockaidValidationSupportedChain>
