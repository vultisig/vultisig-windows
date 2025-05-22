// When adding a new Ethereum L2 chain, add its icon to `core/ui/public/chains` as a lowercase SVG file (e.g. `arbitrum.svg`, `base.svg`)
export const EthereumL2Chain = {
  Arbitrum: 'Arbitrum',
  Base: 'Base',
  Blast: 'Blast',
  Optimism: 'Optimism',
  Zksync: 'Zksync',
} as const

export type EthereumL2Chain =
  (typeof EthereumL2Chain)[keyof typeof EthereumL2Chain]

export const EvmChain = {
  ...EthereumL2Chain,
  Avalanche: 'Avalanche',
  CronosChain: 'CronosChain',
  BSC: 'BSC',
  Ethereum: 'Ethereum',
  Polygon: 'Polygon',
} as const

export type EvmChain = (typeof EvmChain)[keyof typeof EvmChain]

export enum UtxoChain {
  Bitcoin = 'Bitcoin',
  BitcoinCash = 'Bitcoin-Cash',
  Litecoin = 'Litecoin',
  Dogecoin = 'Dogecoin',
  Dash = 'Dash',
}

export enum CosmosChain {
  THORChain = 'THORChain',
  Cosmos = 'Cosmos',
  Osmosis = 'Osmosis',
  MayaChain = 'MayaChain',
  Dydx = 'Dydx',
  Kujira = 'Kujira',
  Terra = 'Terra',
  TerraClassic = 'TerraClassic',
  Noble = 'Noble',
  Akash = 'Akash',
}

export enum OtherChain {
  Sui = 'Sui',
  Solana = 'Solana',
  Polkadot = 'Polkadot',
  Ton = 'Ton',
  Ripple = 'Ripple',
  Tron = 'Tron',
}

export const Chain = {
  ...EvmChain,
  ...UtxoChain,
  ...CosmosChain,
  ...OtherChain,
} as const

export type Chain = (typeof Chain)[keyof typeof Chain]
