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

/*
It's not reliable for non-native tokens,
Thorchain USDC will have id: 0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48
while our USDC will have id: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
*/
export const fromThorchainSwapAsset = (asset: string): CoinKey => {
  const [swapChain, ticker] = asset.split('.');
  const id = asset.split('-')[1] ?? ticker;

  const chainId = mirrorRecord(thorchainSwapChains)[swapChain];

  return { chainId, id };
};
