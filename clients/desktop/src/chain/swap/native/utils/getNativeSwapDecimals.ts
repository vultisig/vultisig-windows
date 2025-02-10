import { chainFeeCoin } from '../../../../coin/chainFeeCoins';
import { Chain } from '@core/chain/Chain';
import { NativeSwapEnabledChain } from '../NativeSwapChain';

export const getNativeSwapDecimals = (chain: NativeSwapEnabledChain) => {
  const { decimals } =
    chainFeeCoin[chain === Chain.MayaChain ? Chain.MayaChain : Chain.THORChain];

  return decimals;
};
