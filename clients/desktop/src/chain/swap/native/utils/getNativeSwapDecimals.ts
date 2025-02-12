import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin';
import { NativeSwapEnabledChain } from '../NativeSwapChain';

export const getNativeSwapDecimals = (chain: NativeSwapEnabledChain) => {
  const { decimals } = chainFeeCoin[chain];

  return decimals;
};
