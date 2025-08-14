import { DeriveChainKind } from '@core/chain/ChainKind'

import { EvmChain, OtherChain } from '../../../Chain'

export const chainsWithTokenMetadataDiscovery = [
  ...Object.values(EvmChain),
  OtherChain.Solana,
] as const

export type ChainWithTokenMetadataDiscovery =
  (typeof chainsWithTokenMetadataDiscovery)[number]

export type ChainKindWithTokenMetadataDiscovery =
  DeriveChainKind<ChainWithTokenMetadataDiscovery>
