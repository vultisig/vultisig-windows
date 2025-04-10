import { Chain, CosmosChain } from '@core/chain/Chain'
import { TW } from '@trustwallet/wallet-core'

import { nativeSwapEnabledChainsRecord } from '../NativeSwapChain'

export type ThorchainSwapEnabledChain =
  (typeof nativeSwapEnabledChainsRecord)[CosmosChain.THORChain][number]

export const thorchainSwapProtoChains: Record<
  ThorchainSwapEnabledChain,
  TW.THORChainSwap.Proto.Chain
> = {
  [Chain.Avalanche]: TW.THORChainSwap.Proto.Chain.AVAX,
  [Chain.BitcoinCash]: TW.THORChainSwap.Proto.Chain.BCH,
  [Chain.BSC]: TW.THORChainSwap.Proto.Chain.BSC,
  [Chain.Bitcoin]: TW.THORChainSwap.Proto.Chain.BTC,
  [Chain.Dogecoin]: TW.THORChainSwap.Proto.Chain.DOGE,
  [Chain.Ethereum]: TW.THORChainSwap.Proto.Chain.ETH,
  [Chain.Cosmos]: TW.THORChainSwap.Proto.Chain.ATOM,
  [Chain.Litecoin]: TW.THORChainSwap.Proto.Chain.LTC,
  [Chain.THORChain]: TW.THORChainSwap.Proto.Chain.THOR,
}
