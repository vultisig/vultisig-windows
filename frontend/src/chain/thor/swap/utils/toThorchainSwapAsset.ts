import { CoinKey } from '../../../../coin/Coin';
import { EntityWithTicker } from '../../../../lib/utils/entities/EntityWithTicker';
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
