import { Chain, EvmChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { Coin } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { findEvmAccountCoins } from './findEvmAccountCoins'
import { findSolanaAccountCoins } from './findSolanaAccountCoins'

export const findAccountCoins = ({
  address,
  chain,
}: ChainAccount): Promise<Coin[]> | Coin[] => {
  const evmChain = isOneOf(chain, Object.values(EvmChain))
  if (evmChain) {
    return findEvmAccountCoins({ address, chain: evmChain })
  }

  if (chain === Chain.Solana) {
    return findSolanaAccountCoins({ address, chain })
  }

  return []
}
