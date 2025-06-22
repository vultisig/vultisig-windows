import { CoinKey } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'

import { isFeeCoin } from '../../../coin/utils/isFeeCoin'
import { nativeSwapChainIds, nativeSwapEnabledChains } from '../NativeSwapChain'

export const toNativeSwapAsset = ({
  chain,
  id,
  ticker,
}: CoinKey & EntityWithTicker): string => {
  if (!isOneOf(chain, nativeSwapEnabledChains)) {
    throw new Error(`No native swap enabled chain found for ${chain}`)
  }

  const swapChainId = nativeSwapChainIds[chain]

  const key = `${swapChainId}.${ticker}`

  if (
    isFeeCoin({ chain, id }) ||
    isOneOf(chain, Object.values(nativeSwapEnabledChains))
  ) {
    return key
  }

  return `${key}-${id}`
}
