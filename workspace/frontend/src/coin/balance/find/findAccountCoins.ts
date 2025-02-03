import { ChainAccount } from '../../../chain/ChainAccount';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { Chain, EvmChain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { findEvmAccountCoins } from './findEvmAccountCoins';
import { findSolanaAccountCoins } from './findSolanaAccountCoins';

export const findAccountCoins = ({
  address,
  chain,
}: ChainAccount): Promise<CoinMeta[]> | CoinMeta[] => {
  const evmChain = isOneOf(chain, Object.values(EvmChain));
  if (evmChain) {
    return findEvmAccountCoins({ address, chain: evmChain });
  }

  if (chain === Chain.Solana) {
    return findSolanaAccountCoins({ address, chain });
  }

  return [];
};
