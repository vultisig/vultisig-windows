import { Chain } from '../../model/chain';
import { getChainFeeCoin } from '../tx/fee/utils/getChainFeeCoin';
import { toChainAmount } from '../utils/toChainAmount';

export const tonConfig = {
  fee: toChainAmount(0.01, getChainFeeCoin(Chain.Ton).decimals),
};
