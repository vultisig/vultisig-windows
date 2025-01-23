import { ChainId } from '@lifi/sdk';

import { Chain, EvmChain } from '../../../model/chain';

export const lifiSwapEnabledChains = [
  ...Object.values(EvmChain),
  Chain.Solana,
  Chain.Bitcoin,
] as const;

export type LifiSwapEnabledChain = (typeof lifiSwapEnabledChains)[number];

export const lifiSwapChainId: Record<LifiSwapEnabledChain, ChainId> = {
  [EvmChain.Ethereum]: ChainId.ETH,
  [EvmChain.BSC]: ChainId.BSC,
  [EvmChain.Arbitrum]: ChainId.ARB,
  [EvmChain.Base]: ChainId.BAS,
  [EvmChain.Blast]: ChainId.BLS,
  [EvmChain.Avalanche]: ChainId.AVA,
  [EvmChain.Polygon]: ChainId.POL,
  [EvmChain.Optimism]: ChainId.OPT,
  [EvmChain.Zksync]: ChainId.ERA,
  [EvmChain.CronosChain]: ChainId.CRO,
  [Chain.Bitcoin]: ChainId.BTC,
  [Chain.Solana]: ChainId.SOL,
};
