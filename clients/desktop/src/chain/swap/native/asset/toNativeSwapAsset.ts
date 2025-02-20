import { CoinKey } from '@core/chain/coin/Coin'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'

import { nativeSwapChainIds, nativeSwapEnabledChains } from '../NativeSwapChain'

export const toNativeSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  const nativeSwapEnabledChain = isOneOf(chain, nativeSwapEnabledChains)

  if (!nativeSwapEnabledChain) {
    throw new Error(`No native swap enabled chain found for ${chain}`)
  }

  const swapChainId = nativeSwapChainIds[nativeSwapEnabledChain]

  const key = `${swapChainId}.${ticker}`

  if (isNativeCoin({ chain, id })) {
    return key
  }

  return `${key}-${id}`
}
