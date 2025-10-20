import { OtherChain } from '../../Chain'
import { DeriveChainKind } from '../../ChainKind'

export const blockaidSimulationSupportedChains = [OtherChain.Solana] as const

export type BlockaidSimulationSupportedChain =
  (typeof blockaidSimulationSupportedChains)[number]
export type BlockaidSimulationSupportedChainKind =
  DeriveChainKind<BlockaidSimulationSupportedChain>
