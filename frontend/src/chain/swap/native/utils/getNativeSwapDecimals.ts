import { Chain } from '../../../../model/chain';
import { getChainFeeCoin } from '../../../tx/fee/utils/getChainFeeCoin';
import { NativeSwapEnabledChain } from '../NativeSwapChain';

export const getNativeSwapDecimals = (chain: NativeSwapEnabledChain) => {
  const { decimals } = getChainFeeCoin(
    chain === Chain.MayaChain ? Chain.MayaChain : Chain.THORChain
  );

  return decimals;
};
