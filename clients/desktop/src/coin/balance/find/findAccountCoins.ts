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
  if (isOneOf(chain, Object.values(EvmChain))) {
    return findEvmAccountCoins({ address, chain })
  }

  if (chain === Chain.Solana) {
    return findSolanaAccountCoins({ address, chain })
  }

  return []
}
