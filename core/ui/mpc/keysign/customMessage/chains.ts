import { Chain, EvmChain } from '@vultisig/core-chain/Chain'

export const customMessageSupportedChains = [
  ...Object.values(EvmChain),
  Chain.Solana,
  Chain.Tron,
] as const

export type CustomMessageSupportedChain =
  (typeof customMessageSupportedChains)[number]

export const customMessageDefaultChain = Chain.Ethereum
