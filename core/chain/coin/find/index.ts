import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { isOneOf } from '@lib/utils/array/isOneOf'

import {
  CoinFinderChainKind,
  coinFinderChainKinds,
} from './CoinFinderChainKind'
import { findCosmosCoins } from './cosmos'
import { findEvmCoins } from './evm'
import { FindCoinsResolver } from './FindCoinsResolver'
import { findSolanaCoins } from './solana'

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
