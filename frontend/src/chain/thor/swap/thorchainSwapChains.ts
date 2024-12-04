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
