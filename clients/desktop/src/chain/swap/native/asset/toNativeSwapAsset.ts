import { CoinKey } from '@core/chain/coin/Coin';
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin';
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';

import { NativeSwapChain, nativeSwapChainIds } from '../NativeSwapChain';

export const toNativeSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  const swapChainId = nativeSwapChainIds[chain as NativeSwapChain];

  if (!swapChainId) {
    throw new Error(`No swap chain id found for ${chain}`);
  }

  const key = `${swapChainId}.${ticker}`;

  if (isFeeCoin({ chain, id })) {
    return key;
  }

  return `${key}-${id}`;
};
