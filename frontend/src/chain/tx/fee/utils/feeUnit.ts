import { Chain, EvmChain, UtxoChain } from '../../../../model/chain';
import { getChainFeeCoin } from './getChainFeeCoin';

export const evmFeeUnit = 'Gwei';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${getChainFeeCoin(chain).ticker}/vbyte`;

export const getFeeUnit = (chain: Chain): string => {
  if (chain in EvmChain) {
    return evmFeeUnit;
  }

  if (chain in UtxoChain) {
    return getUtxoFeeUnit(chain as UtxoChain);
  }

  return getChainFeeCoin(chain).ticker;
};
