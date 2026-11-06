import { Chain } from '@vultisig/core-chain/Chain'
import { getThorchainSecuredAssetL1Asset } from '@vultisig/core-chain/chains/cosmos/thor/securedAssets'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import {
  getNativeSwapChainId,
  thorChainSwapEnabledChains,
} from '@vultisig/core-chain/swap/native/NativeSwapChain'

/**
 * The L1 chain a THORChain secured asset is backed by (`eth-usdc-0x…` →
 * Ethereum), or `null` for anything that is not a secured denom.
 */
export const getThorchainSecuredAssetSourceChain = (
  coin: CoinKey
): Chain | null => {
  const l1Asset = getThorchainSecuredAssetL1Asset(coin)
  if (!l1Asset) return null

  const [chainId] = l1Asset.split('.')

  return (
    thorChainSwapEnabledChains.find(
      chain => getNativeSwapChainId(chain) === chainId
    ) ?? null
  )
}
