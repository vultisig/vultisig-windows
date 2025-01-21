import { Chain } from '../../../model/chain';

export const oneInchSwapEnabledChains = [
  Chain.Ethereum,
  Chain.BSC,
  Chain.Avalanche,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Base,
] as const;

export type OneInchSwapEnabledChain = (typeof oneInchSwapEnabledChains)[number];
