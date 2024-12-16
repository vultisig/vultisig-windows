import { Chain } from '../../../model/chain';

export const mayaSwapEnabledChains = [
  Chain.MayaChain,
  Chain.THORChain,
  Chain.Kujira,
  Chain.Ethereum,
  Chain.Dash,
  Chain.Bitcoin,
  Chain.Arbitrum,
] as const;

export type MayaSwapEnabledChain = (typeof mayaSwapEnabledChains)[number];

export const mayaSwapChains: Record<MayaSwapEnabledChain, string> = {
  [Chain.MayaChain]: 'MAYA',
  [Chain.THORChain]: 'THOR',
  [Chain.Kujira]: 'KUJI',
  [Chain.Ethereum]: 'ETH',
  [Chain.Dash]: 'DASH',
  [Chain.Bitcoin]: 'BTC',
  [Chain.Arbitrum]: 'ARB',
};
