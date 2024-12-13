import { CoinKey } from '../../../../coin/Coin';
import { EntityWithTicker } from '../../../../lib/utils/entities/EntityWithTicker';
import { isNativeCoin } from '../../../utils/isNativeCoin';
import {
  thorchainSwapChains,
  ThorchainSwapEnabledChain,
} from '../thorchainSwapChains';

export const toThorchainSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  const swapChainId = thorchainSwapChains[chain as ThorchainSwapEnabledChain];

  if (!swapChainId) {
    throw new Error(`No swap chain id found for ${chain}`);
  }

  const key = `${swapChainId}.${ticker}`;

  if (isNativeCoin({ chain, id })) {
    return key;
  }

  return `${key}-${id}`;
};
