import { EvmChain, OtherChain } from '../../Chain'

export const blockaidSupportedChains = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
] as const

export type BlockaidSupportedChains = (typeof blockaidSupportedChains)[number]
