import { CoinKey } from '../../../../coin/Coin';
import { EntityWithTicker } from '../../../../lib/utils/entities/EntityWithTicker';
import { mirrorRecord } from '../../../../lib/utils/record/mirrorRecord';
import { isNativeCoin } from '../../../utils/isNativeCoin';
import {
  thorchainSwapChains,
  ThorchainSwapEnabledChain,
} from '../thorchainSwapChains';

export const toThorchainSwapAsset = ({
  chainId,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  const swapChainId = thorchainSwapChains[chainId as ThorchainSwapEnabledChain];

  if (!swapChainId) {
    throw new Error(`No swap chain id found for ${chainId}`);
  }

  const key = `${swapChainId}.${ticker}`;

  if (isNativeCoin({ chainId, id })) {
    return key;
  }

  return `${key}-${id}`;
};

export const fromThorchainSwapAsset = (asset: string): CoinKey => {
  const [swapChain, ticker] = asset.split('.');
  const id = asset.split('-')[1] ?? ticker;

  const chainId = mirrorRecord(thorchainSwapChains)[swapChain];

  return { chainId, id };
};
