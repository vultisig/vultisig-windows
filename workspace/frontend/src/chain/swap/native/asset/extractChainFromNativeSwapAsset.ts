import { mirrorRecord } from '../../../../lib/utils/record/mirrorRecord';
import { nativeSwapChainIds, NativeSwapEnabledChain } from '../NativeSwapChain';

export const extractChainFromNativeSwapAsset = (
  value: string
): NativeSwapEnabledChain => {
  const [chainId] = value.split('.');

  return mirrorRecord(nativeSwapChainIds)[chainId];
};
