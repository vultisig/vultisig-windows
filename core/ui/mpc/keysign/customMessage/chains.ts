import { Chain, CosmosChain, EvmChain } from '@vultisig/core-chain/Chain'

export const customMessageSupportedChains = [
  ...Object.values(EvmChain),
  ...Object.values(CosmosChain),
  Chain.Solana,
  Chain.Sui,
  Chain.Ton,
  Chain.Tron,
  Chain.Polkadot,
  Chain.Cardano,
  Chain.Ripple,
] as const

export type CustomMessageSupportedChain =
  (typeof customMessageSupportedChains)[number]

export const customMessageDefaultChain = Chain.Ethereum
