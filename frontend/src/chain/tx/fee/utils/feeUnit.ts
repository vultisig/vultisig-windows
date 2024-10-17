import { Chain, EvmChain, UtxoChain } from '../../../../model/chain';
import { gwei } from './evm';
import { getChainFeeCoin } from './getChainFeeCoin';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${getChainFeeCoin(chain).ticker}/vbyte`;

export const getFeeUnit = (chain: Chain): string => {
  if (chain in EvmChain) {
    return gwei.symbol;
  }

  if (chain in UtxoChain) {
    return getUtxoFeeUnit(chain as UtxoChain);
  }

  return getChainFeeCoin(chain).ticker;
};
