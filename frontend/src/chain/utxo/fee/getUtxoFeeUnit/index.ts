import { chainFeeCoin } from '../../../../coin/chainFeeCoin';
import { UtxoChain } from '../../../../model/chain';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${chainFeeCoin[chain].ticker}/vbyte`;
