import { thorchainSwapEnabledChains } from '../../chain/thor/swap/thorchainSwapChains';
import { Chain } from '../../model/chain';

export const swapEnabledChains: Chain[] = [
  ...thorchainSwapEnabledChains,
  // TODO: enable these chains when integrated MayaChain/OneInch
  // Chain.Arbitrum,
  // Chain.Dash,
  // Chain.MayaChain,
  // Chain.Kujira,
];
