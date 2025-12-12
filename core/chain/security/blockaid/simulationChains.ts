import { OtherChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'
import { blockaidSupportedEvmChains } from './evmChains'

export const blockaidSimulationSupportedChains = [
  ...blockaidSupportedEvmChains,
  OtherChain.Solana,
] as const

export type BlockaidSimulationSupportedChain =
  (typeof blockaidSimulationSupportedChains)[number]
export type BlockaidSimulationSupportedChainKind =
  DeriveChainKind<BlockaidSimulationSupportedChain>
