import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { Coin } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { findCosmosAccountCoins } from './findCosmosAccount'
import { findEvmAccountCoins } from './findEvmAccountCoins'
import { findSolanaAccountCoins } from './findSolanaAccountCoins'

export const findAccountCoins = ({
  address,
  chain,
}: ChainAccount): Promise<Coin[]> | Coin[] => {
  if (isOneOf(chain, Object.values(EvmChain))) {
    return findEvmAccountCoins({ address, chain })
  }

  if (chain === Chain.Solana) {
    return findSolanaAccountCoins({ address, chain })
  }
  const cosmosChain = isOneOf(chain, Object.values(CosmosChain))
  if (cosmosChain) {
    return findCosmosAccountCoins({ address, chain: cosmosChain })
  }
  return []
}
