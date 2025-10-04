import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { isOneOf } from '@lib/utils/array/isOneOf'

import {
  CoinFinderChainKind,
  coinFinderChainKinds,
} from './CoinFinderChainKind'
import { FindCoinsResolver } from './resolver'
import { findCosmosCoins } from './resolvers/cosmos'
import { findEvmCoins } from './resolvers/evm'
import { findSolanaCoins } from './resolvers/solana'

const resolvers: Record<CoinFinderChainKind, FindCoinsResolver<any>> = {
  cosmos: findCosmosCoins,
  evm: findEvmCoins,
  solana: findSolanaCoins,
}

export const findCoins: FindCoinsResolver<Chain> = async input => {
  const chainKind = getChainKind(input.chain)
  if (!isOneOf(chainKind, coinFinderChainKinds)) {
    throw new Error(
      `Unsupported CoinFinder chain kind: ${chainKind}, should be one of ${coinFinderChainKinds.join(
        ', '
      )}`
    )
  }

  const resolver = resolvers[chainKind]

  return resolver(input)
}
