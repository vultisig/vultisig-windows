import { TW } from '@trustwallet/wallet-core';

import { Chain } from '../../../model/chain';

export const thorchainSwapEnabledChains = [
  Chain.Avalanche,
  Chain.BitcoinCash,
  Chain.BSC,
  Chain.Bitcoin,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Cosmos,
  Chain.Litecoin,
  Chain.THORChain,
] as const;

export type ThorchainSwapEnabledChain =
  (typeof thorchainSwapEnabledChains)[number];

export const thorchainSwapChains: Record<ThorchainSwapEnabledChain, string> = {
  [Chain.Avalanche]: 'AVAX',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.BSC]: 'BSC',
  [Chain.Bitcoin]: 'BTC',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Ethereum]: 'ETH',
  [Chain.Cosmos]: 'GAIA',
  [Chain.Litecoin]: 'LTC',
  [Chain.THORChain]: 'THOR',
};

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
