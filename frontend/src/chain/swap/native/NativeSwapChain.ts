import { withoutDuplicates } from '../../../lib/utils/array/withoutDuplicates';
import { Chain } from '../../../model/chain';

export const nativeSwapChains = [Chain.THORChain, Chain.MayaChain] as const;
export type NativeSwapChain = (typeof nativeSwapChains)[number];

export const nativeSwapStreamingInterval: Record<NativeSwapChain, number> = {
  [Chain.THORChain]: 1,
  [Chain.MayaChain]: 3,
};

export const nativeSwapApiBaseUrl: Record<NativeSwapChain, string> = {
  [Chain.THORChain]: 'https://thornode.ninerealms.com/thorchain',
  [Chain.MayaChain]: 'https://mayanode.mayachain.info/mayachain',
};

export const nativeSwapEnabledChainsRecord = {
  [Chain.THORChain]: [
    Chain.Avalanche,
    Chain.BitcoinCash,
    Chain.BSC,
    Chain.Bitcoin,
    Chain.Dogecoin,
    Chain.Ethereum,
    Chain.Cosmos,
    Chain.Litecoin,
    Chain.THORChain,
  ],
  [Chain.MayaChain]: [
    Chain.MayaChain,
    Chain.THORChain,
    Chain.Kujira,
    Chain.Ethereum,
    Chain.Dash,
    Chain.Bitcoin,
    Chain.Arbitrum,
  ],
} as const;

export type NativeSwapEnabledChain =
  (typeof nativeSwapEnabledChainsRecord)[NativeSwapChain][number];

export const nativeSwapEnabledChains = withoutDuplicates(
  Object.values(nativeSwapEnabledChainsRecord).flatMap(value => value)
) as NativeSwapEnabledChain[];

export const nativeSwapChainIds: Record<NativeSwapEnabledChain, string> = {
  [Chain.Avalanche]: 'AVAX',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.BSC]: 'BSC',
  [Chain.Bitcoin]: 'BTC',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Ethereum]: 'ETH',
  [Chain.Cosmos]: 'GAIA',
  [Chain.Litecoin]: 'LTC',
  [Chain.THORChain]: 'THOR',
  [Chain.MayaChain]: 'MAYA',
  [Chain.Kujira]: 'KUJI',
  [Chain.Dash]: 'DASH',
  [Chain.Arbitrum]: 'ARB',
};
