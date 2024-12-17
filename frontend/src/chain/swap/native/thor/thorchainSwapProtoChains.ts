import { TW } from '@trustwallet/wallet-core';

import { Chain } from '../../../../model/chain';
import { nativeSwapEnabledChainsRecord } from '../NativeSwapChain';

export const thorchainSwapEnabledChains =
  nativeSwapEnabledChainsRecord[Chain.THORChain];

export type ThorchainSwapEnabledChain =
  (typeof thorchainSwapEnabledChains)[number];

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
};
