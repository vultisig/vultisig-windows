import { chainFeeCoin } from '../../../../coin/chainFeeCoin';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { Chain, EvmChain, UtxoChain } from '../../../../model/chain';
import { getUtxoFeeUnit } from '../../../utxo/fee/getUtxoFeeUnit';
import { gwei } from './evm';

export const getFeeUnit = (chain: Chain): string => {
  if (isOneOf(chain, Object.values(EvmChain))) {
    return gwei.name;
  }

  if (isOneOf(chain, Object.values(UtxoChain))) {
    return getUtxoFeeUnit(chain as UtxoChain);
  }

  return chainFeeCoin[chain].ticker;
};
