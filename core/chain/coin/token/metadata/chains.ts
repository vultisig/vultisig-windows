import { DeriveChainKind } from '@core/chain/ChainKind'

import { CosmosChain, EvmChain, OtherChain } from '../../../Chain'

export const chainsWithTokenMetadataDiscovery = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
  OtherChain.Tron,
  ...Object.values(CosmosChain),
] as const

export type ChainWithTokenMetadataDiscovery =
  (typeof chainsWithTokenMetadataDiscovery)[number]

export type ChainKindWithTokenMetadataDiscovery =
  DeriveChainKind<ChainWithTokenMetadataDiscovery>
