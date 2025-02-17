import { CoinKey } from '@core/chain/coin/Coin';
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin';
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';

import { nativeSwapChainIds, NativeSwapEnabledChain } from '../NativeSwapChain';

export const toNativeSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey<NativeSwapEnabledChain> & EntityWithTicker): string => {
  const swapChainId = nativeSwapChainIds[chain];

  const key = `${swapChainId}.${ticker}`;

  if (isNativeCoin({ chain, id })) {
    return key;
  }

  return `${key}-${id}`;
};
