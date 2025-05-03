import { Chain, CosmosChain, EvmChain, OtherChain, UtxoChain } from '../Chain'

const chainIdRecord = {
  [EvmChain.Arbitrum]: '0xa4b1',
  [EvmChain.Avalanche]: '0xa86a',
  [EvmChain.Base]: '0x2105',
  [EvmChain.CronosChain]: '0x19',
  [EvmChain.BSC]: '0x38',
  [EvmChain.Blast]: '0x13e31',
  [EvmChain.Ethereum]: '0x1',
  [EvmChain.Optimism]: '0xa',
  [EvmChain.Polygon]: '0x89',
  [EvmChain.Zksync]: '0x144',

  [UtxoChain.Bitcoin]: '0x1f96',
  [UtxoChain.BitcoinCash]: '0x2710',
  [UtxoChain.Litecoin]: 'Litecoin_litecoin',
  [UtxoChain.Dogecoin]: '0x7d0',
  [UtxoChain.Dash]: 'Dash_dash',

  [CosmosChain.THORChain]: 'thorchain-1',
  [CosmosChain.Cosmos]: 'cosmoshub-4',
  [CosmosChain.Osmosis]: 'osmosis-1',
  [CosmosChain.MayaChain]: 'mayachain-mainnet-v1',
  [CosmosChain.Dydx]: 'dydx-1',
  [CosmosChain.Kujira]: 'kaiyo-1',
  [CosmosChain.Terra]: 'phoenix-1',
  [CosmosChain.TerraClassic]: 'columbus-5',
  [CosmosChain.Noble]: 'noble-1',
  [CosmosChain.Akash]: 'akashnet-2',

  [OtherChain.Sui]: '0x35834a8a',
  [OtherChain.Solana]: 'Solana_mainnet-beta',
  [OtherChain.Polkadot]: '0x3e4',
  [OtherChain.Ton]: '0x44c',
  [OtherChain.Ripple]: '0x1df4',
  [OtherChain.Tron]: '0x2b6653dc',
} as const

type DeriveChainId<T> = T extends Chain ? (typeof chainIdRecord)[T] : never
type ChainIdRecord = typeof chainIdRecord
export type EVMChainId = ChainIdRecord[EvmChain]
export type CosmosChainId = ChainIdRecord[CosmosChain]

export function getChainId<T extends Chain>(chain: T): DeriveChainId<T> {
  return chainIdRecord[chain] as DeriveChainId<T>
}

export function getChainByChainId(chainId: string): Chain | undefined {
  return Object.entries(chainIdRecord).find(([, id]) => id === chainId)?.[0] as
    | Chain
    | undefined
}
