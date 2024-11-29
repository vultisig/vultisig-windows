import { UtxoChain } from '../../../../model/chain';
import { getChainFeeCoin } from '../../../tx/fee/utils/getChainFeeCoin';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${getChainFeeCoin(chain).ticker}/vbyte`;
