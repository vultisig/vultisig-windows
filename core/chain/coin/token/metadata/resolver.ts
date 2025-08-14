import { CoinKey, CoinMetadata, Token } from '@core/chain/coin/Coin'
import { Resolver } from '@lib/utils/types/Resolver'

import { ChainWithTokenMetadataDiscovery } from './chains'

export type TokenMetadataResolver<
  T extends ChainWithTokenMetadataDiscovery = ChainWithTokenMetadataDiscovery,
> = Resolver<Token<CoinKey<T>>, Promise<CoinMetadata>>
