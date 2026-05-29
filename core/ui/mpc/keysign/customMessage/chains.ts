import { Chain, CosmosChain, EvmChain } from '@vultisig/core-chain/Chain'

export const customMessageSupportedChains = [
  ...Object.values(EvmChain),
  ...Object.values(CosmosChain),
  Chain.Solana,
  Chain.Ton,
  Chain.Tron,
  Chain.Polkadot,
  Chain.Cardano,
] as const

export type CustomMessageSupportedChain =
  (typeof customMessageSupportedChains)[number]

export const customMessageDefaultChain = Chain.Ethereum
