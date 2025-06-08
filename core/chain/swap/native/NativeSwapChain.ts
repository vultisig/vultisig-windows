import { Chain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'

import { DeriveChainKind } from '../../ChainKind'

export const nativeSwapChains = [Chain.THORChain, Chain.MayaChain] as const
export type NativeSwapChain = (typeof nativeSwapChains)[number]

export const nativeSwapStreamingInterval: Record<NativeSwapChain, number> = {
  [Chain.THORChain]: 1,
  [Chain.MayaChain]: 3,
}

export const nativeSwapApiBaseUrl: Record<NativeSwapChain, string> = {
  [Chain.THORChain]: `${cosmosRpcUrl[Chain.THORChain]}/thorchain`,
  [Chain.MayaChain]: `${cosmosRpcUrl[Chain.MayaChain]}/mayachain`,
}

const thorChainSwapEnabledEvmChains = [
  Chain.Avalanche,
  Chain.BSC,
  Chain.Ethereum,
] as const

export type ThorChainSwapEnabledEvmChain =
  (typeof thorChainSwapEnabledEvmChains)[number]

const thorChainSwapEnabledUtxoChains = [
  Chain.BitcoinCash,
  Chain.Bitcoin,
  Chain.Dogecoin,
  Chain.Litecoin,
] as const

export type ThorChainSwapEnabledUtxoChain =
  (typeof thorChainSwapEnabledUtxoChains)[number]

const thorChainSwapEnabledCosmosChains = [
  Chain.Cosmos,
  Chain.THORChain,
] as const

export type ThorChainSwapEnabledCosmosChain =
  (typeof thorChainSwapEnabledCosmosChains)[number]

export const thorChainSwapEnabledChains = [
  ...thorChainSwapEnabledEvmChains,
  ...thorChainSwapEnabledUtxoChains,
  ...thorChainSwapEnabledCosmosChains,
] as const

export type ThorChainSwapEnabledChain =
  (typeof thorChainSwapEnabledChains)[number]

export type ThorChainSwapEnabledChainKind =
  DeriveChainKind<ThorChainSwapEnabledChain>

export const nativeSwapEnabledChainsRecord = {
  [Chain.THORChain]: thorChainSwapEnabledChains,
  [Chain.MayaChain]: [
    Chain.MayaChain,
    Chain.THORChain,
    Chain.Kujira,
    Chain.Ethereum,
    Chain.Dash,
    Chain.Bitcoin,
    Chain.Arbitrum,
    Chain.Zcash,
  ],
} as const

type NativeSwapEnabledChain =
  (typeof nativeSwapEnabledChainsRecord)[NativeSwapChain][number]

export const nativeSwapEnabledChains = withoutDuplicates(
  Object.values(nativeSwapEnabledChainsRecord).flatMap(value => value)
) as NativeSwapEnabledChain[]

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
  [Chain.Zcash]: 'ZEC',
}
