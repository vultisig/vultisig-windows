import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { nativeSwapDecimals } from '../config'
import { nativeSwapChains } from '../NativeSwapChain'

export const getNativeSwapDecimals = (coin: CoinKey) => {
  if (isOneOf(coin.chain, nativeSwapChains) && isFeeCoin(coin)) {
    return chainFeeCoin[coin.chain].decimals
  }

  return nativeSwapDecimals
}
