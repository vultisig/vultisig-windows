import { Chain, EvmChain } from '../../../../model/chain';
import { gwei } from './evm';
import { getChainFeeCoin } from './getChainFeeCoin';

export const getFeeAmountDecimals = (chain: Chain): number =>
  chain in EvmChain ? gwei.decimals : getChainFeeCoin(chain).decimals;
