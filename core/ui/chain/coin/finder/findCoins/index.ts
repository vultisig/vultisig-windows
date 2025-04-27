import { Chain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'

import { CoinFinderChain } from './coinFinderChains'
import { FindCoinsResolver } from './FindCoinsResolver'
import { findThorChainCoins } from './findThorChainCoins'

const resolvers: Record<CoinFinderChain, FindCoinsResolver> = {
  [Chain.THORChain]: findThorChainCoins,
}

export type FindCoinsInput = ChainAccount<CoinFinderChain>

export const findCoins = async ({ chain, address }: FindCoinsInput) => {
  const resolver = resolvers[chain]

  return resolver({ address })
}
