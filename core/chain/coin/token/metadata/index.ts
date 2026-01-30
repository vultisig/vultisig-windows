import { getChainKind } from '@core/chain/ChainKind'

import { ChainKindWithTokenMetadataDiscovery } from './chains'
import { TokenMetadataResolver } from './resolver'
import { getCosmosTokenMetadata } from './resolvers/cosmos'
import { getEvmTokenMetadata } from './resolvers/evm'
import { getSolanaTokenMetadata } from './resolvers/solana'
import { getTronTokenMetadata } from './resolvers/tron'

const resolvers: Record<
  ChainKindWithTokenMetadataDiscovery,
  TokenMetadataResolver<any>
> = {
  evm: getEvmTokenMetadata,
  solana: getSolanaTokenMetadata,
  cosmos: getCosmosTokenMetadata,
  tron: getTronTokenMetadata,
}

export const getTokenMetadata: TokenMetadataResolver = async input => {
  const chainKind = getChainKind(input.chain)

  const resolver = resolvers[chainKind]

  return resolver(input)
}
